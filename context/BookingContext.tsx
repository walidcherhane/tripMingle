// context/BookingContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BookingData,
  BookingStep,
  LocationData,
  TripStatus,
  VehicleOption,
  DriverProfile,
  TripDetails,
  PaymentMethod,
  PriceBreakdown,
  TripTiming,
  RouteEstimate,
} from "@/types/booking";
import { useRouter } from "expo-router";
import { usePlacesQuery } from "@/hooks/usePlacesQuery";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";

// Initial booking data
const initialBookingData: BookingData = {
  pickupLocation: null,
  dropoffLocation: null,
  timing: {
    isScheduled: false,
  },
  tripDetails: {
    passengers: 1,
    luggage: 0,
  },
  status: TripStatus.SEARCHING,
};

interface BookingContextProps {
  bookingData: BookingData;
  currentStep: BookingStep;
  routeEstimate: RouteEstimate | null;

  // data Loading
  isLoadingDistanceMatrix: boolean;
  isLoading: boolean;
  // Update methods
  setLocations: (pickup: LocationData, dropoff: LocationData) => void;
  setVehicle: (vehicle: VehicleOption) => void;
  setTiming: (timing: TripTiming) => void;
  setTripDetails: (details: TripDetails) => void;
  setDriver: (driver: DriverProfile) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPrice: (price: PriceBreakdown) => void;
  updateStatus: (status: TripStatus) => void;
  // Navigation helpers
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (step: BookingStep) => void;
  resetCurrentStep: () => void;
  // Booking actions
  startBooking: () => void;
  confirmBooking: () => Promise<boolean>;
  cancelBooking: (reason?: string) => Promise<boolean>;
  completeTrip: () => Promise<boolean>;
  resetBooking: () => void;
  handleDriverResponse: (
    tripId: string,
    response: "accept" | "refuse",
    driverDetails?: {
      id: string;
      firstName: string;
      lastName: string;
      rating: number;
      languages: string[];
      vehicle: {
        brand: string;
        model: string;
        year: string;
        color: string;
        licensePlate: string;
        imageUri: string;
      };
      eta: number;
    },
    refusalReason?: string
  ) => Promise<void>;
  // Route estimate
}

// Create context
const BookingContext = createContext<BookingContextProps | undefined>(
  undefined
);

// Step to route mapping
const stepToRouteMapping: Record<BookingStep, string> = {
  [BookingStep.LOCATION]: "/(main)/client/booking",
  [BookingStep.DETAILS]: "/(main)/client/booking/details",
  [BookingStep.RIDES]: "/(main)/client/booking/rides",
  [BookingStep.CONFIRMATION]: "/(main)/client/booking/confirmation",
  [BookingStep.PAYMENT]: "/(main)/client/booking/payment",
  [BookingStep.ACTIVE]: "/(main)/client/booking/active",
};

// Provider component
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  console.log("[DEBUG] BookingProvider rendering");

  const router = useRouter();
  const { user } = useAuth();
  const [bookingData, setBookingData] =
    useState<BookingData>(initialBookingData);
  const [currentStep, setCurrentStep] = useState<BookingStep>(() => {
    console.log(
      "[DEBUG] Initializing BookingProvider with step:",
      BookingStep.LOCATION
    );
    return BookingStep.LOCATION;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Log when the current step changes
  useEffect(() => {
    console.log("[DEBUG] Current step changed to:", currentStep);
  }, [currentStep]);

  // service hooks
  const { useDistanceMatrix } = usePlacesQuery();

  // Memoize the distance matrix parameters to prevent unnecessary re-fetches
  const distanceMatrixParams = useMemo(() => {
    console.log("[DEBUG] Recalculating distanceMatrixParams", {
      hasPickup: !!bookingData.pickupLocation?.address,
      hasDropoff: !!bookingData.dropoffLocation?.address,
      pickupLat: bookingData.pickupLocation?.latitude,
      pickupLng: bookingData.pickupLocation?.longitude,
      dropoffLat: bookingData.dropoffLocation?.latitude,
      dropoffLng: bookingData.dropoffLocation?.longitude,
    });

    if (
      !bookingData.pickupLocation?.latitude ||
      !bookingData.pickupLocation?.longitude ||
      !bookingData.dropoffLocation?.latitude ||
      !bookingData.dropoffLocation?.longitude
    ) {
      console.log("[DEBUG] Missing coordinates for distanceMatrixParams");
      return null;
    }

    return {
      origin: {
        lat: bookingData.pickupLocation.latitude,
        lng: bookingData.pickupLocation.longitude,
      },
      destination: {
        lat: bookingData.dropoffLocation.latitude,
        lng: bookingData.dropoffLocation.longitude,
      },
    };
  }, [
    bookingData.pickupLocation?.latitude,
    bookingData.pickupLocation?.longitude,
    bookingData.dropoffLocation?.latitude,
    bookingData.dropoffLocation?.longitude,
  ]);

  // Use the distance matrix query to get route information
  const distanceMatrixQuery = useDistanceMatrix(
    distanceMatrixParams || {
      origin: { lat: 0, lng: 0 },
      destination: { lat: 0, lng: 0 },
    },
    !!distanceMatrixParams
  );

  // Derive route estimate from distance matrix data
  const routeEstimate = useMemo(() => {
    console.log("[DEBUG] Recalculating routeEstimate", {
      isLoading: distanceMatrixQuery.isLoading,
      hasData: !!distanceMatrixQuery.data,
      error: distanceMatrixQuery.error ? "Error exists" : "No error",
    });

    if (
      distanceMatrixQuery.isLoading ||
      !distanceMatrixQuery.data ||
      !distanceMatrixQuery.data.rows?.[0]?.elements?.[0]
    ) {
      console.log("[DEBUG] Missing data for routeEstimate");
      return null;
    }

    const element = distanceMatrixQuery.data.rows[0].elements[0];

    if (element.status !== "OK") {
      console.log(
        "[DEBUG] Invalid element status for routeEstimate:",
        element.status
      );
      return null;
    }

    const routeData = {
      distance: element.distance,
      duration: element.duration,
    };

    console.log("[DEBUG] Created routeEstimate:", routeData);
    return routeData;
  }, [
    distanceMatrixQuery.isLoading,
    distanceMatrixQuery.data,
    distanceMatrixQuery.error,
  ]);

  // Update the booking data with the route estimate
  useEffect(() => {
    console.log("[DEBUG] Route estimate effect running", {
      hasRouteEstimate: !!routeEstimate,
      status: bookingData.status,
    });

    if (!routeEstimate || bookingData.status !== TripStatus.SEARCHING) {
      return;
    }

    setBookingData((prev) => ({
      ...prev,
      estimatedDistance: routeEstimate.distance.value,
      estimatedDuration: routeEstimate.duration.value,
    }));
  }, [routeEstimate, bookingData.status]);

  // Convex mutations
  const createTripRequest = useMutation(api.trips.createTripRequest);
  const setTripPricing = useMutation(api.trips.setTripPricing);
  const setTripPaymentMethod = useMutation(api.trips.setPaymentMethod);
  const cancelTrip = useMutation(api.trips.cancelTrip);
  const updateTripStatus = useMutation(api.trips.updateTripStatus);

  // Navigation helpers
  const goToNextStep = () => {
    console.log("[DEBUG] goToNextStep - Current step:", currentStep);
    const steps = Object.values(BookingStep);
    const currentIndex = steps.indexOf(currentStep);
    console.log(
      "[DEBUG] goToNextStep - Current index:",
      currentIndex,
      "of",
      steps.length - 1,
      "Steps array:",
      steps
    );

    // If currentStep is not found in the steps array, reset to LOCATION
    if (currentIndex === -1) {
      console.log(
        "[DEBUG] goToNextStep - Current step not found in steps array, resetting to LOCATION"
      );
      setCurrentStep(BookingStep.LOCATION);
      router.push(stepToRouteMapping[BookingStep.LOCATION] as any);
      return;
    }

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1] as BookingStep;
      console.log("[DEBUG] goToNextStep - Next step calculated:", nextStep);
      console.log(
        "[DEBUG] goToNextStep - Next route:",
        stepToRouteMapping[nextStep]
      );
      setCurrentStep(nextStep);
      try {
        router.push(stepToRouteMapping[nextStep] as any);
        console.log("[DEBUG] goToNextStep - Navigation completed");
      } catch (error) {
        console.error("[DEBUG] goToNextStep - Navigation error:", error);
      }
    } else {
      console.log("[DEBUG] goToNextStep - Already at last step");
    }
  };

  const goToPreviousStep = () => {
    const steps = Object.values(BookingStep);
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1] as BookingStep;
      setCurrentStep(prevStep);
      router.push(stepToRouteMapping[prevStep] as any);
    }
  };

  const goToStep = (step: BookingStep) => {
    setCurrentStep(step);
    router.push(stepToRouteMapping[step] as any);
  };

  // Define polling interval value in milliseconds
  const POLLING_INTERVAL_MS = 5000; // 5 seconds

  // Setup real-time trip status monitoring
  const tripQuery = useQuery(
    api.trips.getTrip,
    bookingData.bookingId
      ? { tripId: bookingData.bookingId as unknown as Id<"trips"> }
      : "skip"
  );

  // Update local state when trip status changes from Convex
  useEffect(() => {
    if (!tripQuery) return;

    // Only update if the status is different
    if (tripQuery.status && tripQuery.status !== bookingData.status) {
      console.log(
        `[DEBUG] Updating trip status from ${bookingData.status} to ${tripQuery.status}`
      );

      // Update the booking data status
      setBookingData((prev) => ({
        ...prev,
        status: tripQuery.status as TripStatus,
        updatedAt: new Date(),
      }));

      // For active trips, make sure we're on the active screen
      if (
        (tripQuery.status === "driverMatched" ||
          tripQuery.status === "driverApproaching" ||
          tripQuery.status === "driverArrived" ||
          tripQuery.status === "inProgress") &&
        currentStep !== BookingStep.ACTIVE
      ) {
        goToStep(BookingStep.ACTIVE);
      }
    }
  }, [tripQuery, bookingData.status, currentStep, goToStep]);

  // Set up polling for trip status updates for backups and special cases
  useEffect(() => {
    // Only poll if we have a booking ID and we're in the SEARCHING state
    // This is a fallback in case real-time updates aren't working
    if (!bookingData.bookingId || bookingData.status !== TripStatus.SEARCHING) {
      return;
    }

    console.log(
      `[DEBUG] Setting up backup polling interval at ${POLLING_INTERVAL_MS}ms`
    );

    const intervalId = setInterval(async () => {
      try {
        // Only check manually if real-time updates might be delayed
        if (bookingData.status === TripStatus.SEARCHING) {
          // We could implement a manual check here if needed
          console.log("[DEBUG] Backup polling check for trip status");
        }
      } catch (error) {
        console.error("Error in polling interval:", error);
      }
    }, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [bookingData.bookingId, bookingData.status]);

  // Load saved booking data from storage only once on mount
  useEffect(() => {
    console.log("[DEBUG] Initial load effect running");
    let isMounted = true;

    const loadBookingData = async () => {
      try {
        console.log("[DEBUG] Loading booking data from AsyncStorage");
        const savedData = await AsyncStorage.getItem("bookingData");

        // Only update state if component is still mounted
        if (savedData && isMounted) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log("[DEBUG] Found saved booking data", {
              hasPickup: !!parsedData.pickupLocation,
              hasDropoff: !!parsedData.dropoffLocation,
              status: parsedData.status,
            });

            // Validate parsed data has required properties and is a valid active trip
            if (
              parsedData &&
              parsedData.pickupLocation &&
              parsedData.dropoffLocation &&
              parsedData.bookingId &&
              (parsedData.status === TripStatus.SEARCHING ||
                parsedData.status === TripStatus.DRIVER_MATCHED ||
                parsedData.status === TripStatus.DRIVER_APPROACHING ||
                parsedData.status === TripStatus.DRIVER_ARRIVED ||
                parsedData.status === TripStatus.IN_PROGRESS)
            ) {
              console.log("[DEBUG] Setting booking data from storage");
              setBookingData(parsedData);

              // Set the current step to active if we have an ongoing trip
              setCurrentStep(BookingStep.ACTIVE);
            } else {
              console.log(
                "[DEBUG] Saved booking data exists but isn't an active trip, using defaults"
              );
            }
          } catch (parseError) {
            console.error("Error parsing saved booking data:", parseError);
          }
        }
      } catch (error) {
        console.error("Error loading booking data:", error);
      }
    };

    loadBookingData();

    // Cleanup function to prevent state updates after unmounting
    return () => {
      console.log("[DEBUG] Initial load effect cleanup");
      isMounted = false;
    };
  }, []);

  // Save booking data to storage when it changes
  useEffect(() => {
    console.log("[DEBUG] Save effect running", {
      pickupLat: bookingData.pickupLocation?.latitude,
      dropoffLat: bookingData.dropoffLocation?.latitude,
      status: bookingData.status,
      bookingId: bookingData.bookingId,
    });

    // Skip the initial render to avoid unnecessary storage operations
    const isInitialBooking =
      !bookingData.bookingId &&
      !bookingData.pickupLocation?.address &&
      !bookingData.dropoffLocation?.address;

    if (isInitialBooking) {
      console.log("[DEBUG] Skipping save - initial booking data");
      return;
    }

    const saveBookingData = async () => {
      try {
        console.log("[DEBUG] Saving booking data to AsyncStorage");
        await AsyncStorage.setItem("bookingData", JSON.stringify(bookingData));
      } catch (error) {
        console.error("Error saving booking data:", error);
      }
    };

    saveBookingData();
  }, [
    bookingData.pickupLocation,
    bookingData.dropoffLocation,
    bookingData.selectedVehicle,
    bookingData.timing,
    bookingData.tripDetails,
    bookingData.status,
    bookingData.bookingId,
  ]);

  // Update methods
  const setLocations = (pickup: LocationData, dropoff: LocationData) => {
    console.log("[DEBUG] setLocations called", {
      pickup: {
        lat: pickup.latitude,
        lng: pickup.longitude,
      },
      dropoff: {
        lat: dropoff.latitude,
        lng: dropoff.longitude,
      },
    });
    setBookingData((prev) => ({
      ...prev,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
    }));
  };

  const setVehicle = (vehicle: VehicleOption) => {
    console.log("[DEBUG] setVehicle called", {
      vehicleId: vehicle.id,
      category: vehicle.category,
    });
    setBookingData((prev) => ({ ...prev, selectedVehicle: vehicle }));
  };

  const setTiming = (timing: TripTiming) => {
    console.log("[DEBUG] setTiming called", {
      isScheduled: timing.isScheduled,
    });
    setBookingData((prev) => ({ ...prev, timing }));
  };

  const setTripDetails = (details: TripDetails) => {
    console.log("[DEBUG] setTripDetails called", {
      passengers: details.passengers,
      luggage: details.luggage,
    });
    setBookingData((prev) => ({ ...prev, tripDetails: details }));
  };

  const setDriver = (driver: DriverProfile) => {
    setBookingData((prev) => ({ ...prev, driver }));
  };

  const setPaymentMethod = (method: PaymentMethod) => {
    setBookingData((prev) => ({ ...prev, paymentMethod: method }));
  };

  const setPrice = (price: PriceBreakdown) => {
    setBookingData((prev) => ({ ...prev, price }));
  };

  const updateStatus = (status: TripStatus) => {
    console.log("[DEBUG] updateStatus called", { status });
    setBookingData((prev) => ({ ...prev, status }));
  };

  // Booking actions
  const startBooking = () => {
    setBookingData(initialBookingData);
    setCurrentStep(BookingStep.LOCATION);
    router.push(stepToRouteMapping[BookingStep.LOCATION] as any);
  };

  const allPartners = useQuery(api.drivers.getAvailableDrivers, {
    latitude: bookingData.pickupLocation?.latitude || 0,
    longitude: bookingData.pickupLocation?.longitude || 0,
    vehicleCategory: bookingData.selectedVehicle?.category,
    minCapacity: bookingData.tripDetails.passengers,
  });

  const selectedPartner = useQuery(
    api.drivers.getDriverById,
    bookingData.driver?.id
      ? {
          driverId: bookingData.driver?.id!,
        }
      : "skip"
  );

  const selectedVehicle = useQuery(
    api.vehicles.getVehicle,
    bookingData.selectedVehicle?.id
      ? {
          vehicleId: bookingData.selectedVehicle?.id!,
        }
      : "skip"
  );

  const confirmBooking = async (): Promise<boolean> => {
    console.log("[DEBUG] confirmBooking called");
    if (!user?._id) {
      console.error("No user id found");
      return false;
    }

    try {
      setIsLoading(true);

      // Ensure we have all required data
      if (
        !bookingData.pickupLocation?.latitude ||
        !bookingData.pickupLocation?.longitude ||
        !bookingData.dropoffLocation?.latitude ||
        !bookingData.dropoffLocation?.longitude ||
        !bookingData.tripDetails ||
        !bookingData.selectedVehicle
      ) {
        console.error("Missing required booking data");
        return false;
      }

      // Get available partners
      const availablePartners = allPartners || [];

      if (!availablePartners || availablePartners.length === 0) {
        console.error("No available partners found");
        return false;
      }

      if (!selectedPartner) {
        console.error("No vehicle found for partner");
        return false;
      }

      // Get estimated distance and duration from routeEstimate
      const estimatedDistance = routeEstimate?.distance.value || 0;
      const estimatedDuration = routeEstimate?.duration.value
        ? Math.round(routeEstimate.duration.value / 60)
        : 0;

      // Create a trip request in Convex
      const tripId = await createTripRequest({
        clientId: user._id,
        partnerId: bookingData.driver?.id!,
        vehicleId: bookingData.selectedVehicle?.id!,
        pickupLocation: {
          address: bookingData.pickupLocation?.address,
          latitude: bookingData.pickupLocation?.latitude,
          longitude: bookingData.pickupLocation?.longitude,
          placeName: bookingData.pickupLocation?.placeName,
        },
        dropoffLocation: {
          address: bookingData.dropoffLocation.address,
          latitude: bookingData.dropoffLocation.latitude,
          longitude: bookingData.dropoffLocation.longitude,
          placeName: bookingData.dropoffLocation.placeName,
        },
        tripDetails: {
          passengers: bookingData.tripDetails.passengers,
          luggage: bookingData.tripDetails.luggage,
          specialRequests: bookingData.tripDetails.specialRequests,
        },
        timing: {
          isScheduled: bookingData.timing.isScheduled,
          departureDate: bookingData.timing.departureDate?.toISOString(),
          departureTime: bookingData.timing.departureTime?.toISOString(),
        },
        estimatedDistance,
        estimatedDuration,
      });

      // Set the pricing
      if (bookingData.selectedVehicle && estimatedDistance) {
        const distanceInKm = estimatedDistance / 1000;

        // Calculate price based on distance and vehicle rates
        const baseFare = bookingData.selectedVehicle.baseFare;
        const distanceFare =
          distanceInKm * bookingData.selectedVehicle.pricePerKm;
        const taxes = (baseFare + distanceFare) * 0.2; // 20% tax
        const total = baseFare + distanceFare + taxes;

        await setTripPricing({
          tripId,
          pricing: {
            baseFare,
            distanceFare,
            taxes,
            total,
            currency: "MAD", // Moroccan Dirham
          },
        });
      }

      // Update booking data with trip id and set status to pending
      setBookingData((prev) => ({
        ...prev,
        bookingId: tripId,
        status: TripStatus.SEARCHING, // Changed from "PENDING" to match the enum
      }));

      // Navigate to active trip screen
      goToStep(BookingStep.ACTIVE);

      console.log("Trip confirmed with id:", tripId);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error confirming booking:", error);
      setIsLoading(false);
      return false;
    }
  };

  // Handle trip response from driver (accept/refuse)
  const handleDriverResponse = async (
    tripId: string,
    response: "accept" | "refuse",
    driverDetails?: {
      id: string;
      firstName: string;
      lastName: string;
      rating: number;
      languages: string[];
      vehicle: {
        brand: string;
        model: string;
        year: string;
        color: string;
        licensePlate: string;
        imageUri: string;
      };
      eta: number;
    },
    refusalReason?: string
  ): Promise<void> => {
    if (response === "accept" && driverDetails) {
      // Update the booking data with driver details
      setBookingData((prev) => ({
        ...prev,
        driver: {
          id: driverDetails.id as unknown as Id<"users">,
          firstName: driverDetails.firstName,
          lastName: driverDetails.lastName,
          rating: driverDetails.rating,
          languages: driverDetails.languages,
          vehicle: {
            brand: driverDetails.vehicle.brand,
            model: driverDetails.vehicle.model,
            year: driverDetails.vehicle.year,
            color: driverDetails.vehicle.color,
            licensePlate: driverDetails.vehicle.licensePlate,
            imageUri: driverDetails.vehicle.imageUri,
          },
          eta: driverDetails.eta,
        },
        status: TripStatus.DRIVER_MATCHED,
      }));

      // If the user is not on the active trip screen, navigate there
      if (currentStep !== BookingStep.ACTIVE) {
        goToStep(BookingStep.ACTIVE);
      }

      // Update trip status in the backend
      try {
        await updateTripStatus({
          tripId: tripId as Id<"trips">,
          status: "driverMatched",
        });
      } catch (error) {
        console.error("Error updating trip status:", error);
      }
    } else if (response === "refuse") {
      // Handle refusal - update status and show refusal message
      setBookingData((prev) => ({
        ...prev,
        status: TripStatus.CANCELLED,
      }));

      try {
        // Here we would update the trip in the database
        await updateTripStatus({
          tripId: tripId as Id<"trips">,
          status: "cancelled",
        });
      } catch (error) {
        console.error("Error updating trip status:", error);
      }
    }
  };

  const cancelBooking = async (reason?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!bookingData.bookingId) {
        throw new Error("No booking ID found");
      }

      // Cancel trip in Convex
      await cancelTrip({
        tripId: bookingData.bookingId as unknown as Id<"trips">,
        cancellationReason: reason || "Cancelled by user",
        cancelledBy: "client",
      });

      // Update local booking data
      setBookingData((prev) => ({
        ...prev,
        status: TripStatus.CANCELLED,
        updatedAt: new Date(),
      }));

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setIsLoading(false);
      return false;
    }
  };

  const completeTrip = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!bookingData.bookingId) {
        throw new Error("No booking ID found");
      }

      // Complete trip in Convex
      await updateTripStatus({
        tripId: bookingData.bookingId as unknown as Id<"trips">,
        status: "completed",
      });

      // Update local booking data
      setBookingData((prev) => ({
        ...prev,
        status: TripStatus.COMPLETED,
        updatedAt: new Date(),
      }));

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error completing trip:", error);
      setIsLoading(false);
      return false;
    }
  };

  const resetBooking = () => {
    // Clear booking data from AsyncStorage
    AsyncStorage.removeItem("bookingData").catch((error) => {
      console.error("Error removing booking data from storage:", error);
    });

    // Reset state to initial values
    setBookingData(initialBookingData);
    setCurrentStep(BookingStep.LOCATION);
  };

  const resetCurrentStep = () => {
    setCurrentStep(BookingStep.LOCATION);
  };

  const contextValue: BookingContextProps = {
    bookingData,
    currentStep,
    routeEstimate,
    isLoadingDistanceMatrix: distanceMatrixQuery.isLoading,
    isLoading,
    setLocations,
    setVehicle,
    setTiming,
    setTripDetails,
    setDriver,
    setPaymentMethod,
    setPrice,
    updateStatus,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    resetCurrentStep,
    startBooking,
    confirmBooking,
    cancelBooking,
    completeTrip,
    resetBooking,
    handleDriverResponse,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);

  // Check if we're in a partner route and return null context
  // Check for web location pathname
  const pathname =
    typeof window !== "undefined" ? window.location?.pathname : "";

  // TypeScript-safe way to check for partner routes
  let isExpoPartnerRoute = false;
  try {
    // @ts-ignore - Accessing Expo Router internal state
    if (typeof global !== "undefined" && global.__NAVIGATION_STATE__?.key) {
      // @ts-ignore - Accessing Expo Router internal state
      isExpoPartnerRoute = global.__NAVIGATION_STATE__.key.includes("partner");
    }
  } catch (e) {
    // Silently fail if we can't access the navigation state
  }

  const isPartnerRoute = pathname?.includes("/partner/") || isExpoPartnerRoute;

  if (!context) {
    if (isPartnerRoute) {
      console.log("[INFO] Using dummy BookingContext in partner route");
      // Create a dummy context for partner routes
      return {
        bookingData: initialBookingData,
        currentStep: BookingStep.LOCATION,
        routeEstimate: null,
        isLoadingDistanceMatrix: false,
        isLoading: false,
        setLocations: () => {},
        setVehicle: () => {},
        setTiming: () => {},
        setTripDetails: () => {},
        setDriver: () => {},
        setPaymentMethod: () => {},
        setPrice: () => {},
        updateStatus: () => {},
        goToNextStep: () => {},
        goToPreviousStep: () => {},
        goToStep: () => {},
        resetCurrentStep: () => {},
        startBooking: () => {},
        confirmBooking: async () => false,
        cancelBooking: async () => false,
        completeTrip: async () => false,
        resetBooking: () => {},
        handleDriverResponse: async () => {},
      } as BookingContextProps;
    }

    throw new Error("useBooking must be used within a BookingProvider");
  }

  return context;
};
