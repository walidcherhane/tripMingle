// app/(main)/client/booking/rides.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/context/BookingContext";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Star,
  Clock,
  Car,
  Users,
  Filter,
  ChevronDown,
  ArrowRight,
  Briefcase,
  CreditCard,
  Check,
} from "lucide-react-native";
import Map from "@/components/client/common/map";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
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
  VehicleCategory,
} from "@/types/booking";
import { useTotalTrips } from "@/hooks/useTotalTrips";
import useStorageUrl from "@/hooks/useStorageUrl";

// Define interfaces for the data structure
interface ConvexDriverData {
  id: string;
  name: string;
  photo: string | { _id: Id<"_storage"> };
  vehicle: {
    id: string;
    model: string;
    type: string;
    image: string | { _id: Id<"_storage"> };
    capacity: number;
  };
  rating: number;
  distance: string;
  eta: string;
  priceRange: {
    min: number;
    max: number;
  };
  status: string;
}

interface RideData {
  id: string;
  driver: {
    _id: Id<"users">;
    firstName?: string;
    lastName?: string;
    rating?: number;
    totalTrips?: number;
    profileImage?: Id<"_storage">;
    languages?: string[];
    photoUrl?: string | null;
    userType: "client" | "partner";
  };
  vehicle: {
    _id: Id<"vehicles">;
    brand: string;
    model: string;
    year: string;
    color: string;
    licensePlate: string;
    capacity: number;
    features?: string[];
    photoUrl?: string | null;
    vehicleImage?: Id<"_storage">;
    images: Id<"_storage">[];
    pricePerKm: number;
    baseFare: number;
    category: VehicleCategory;
  };
  pricePerKm: number;
  estimatedPrice: number;
  eta: number;
  distance: number;
}

// Sort options
type SortOption = "eta" | "price" | "rating";

export default function AvailableRidesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    bookingData,
    setVehicle,
    setDriver,
    goToNextStep,
    routeEstimate,
    currentStep,
    goToStep,
    resetCurrentStep,
  } = useBooking();

  // Debug and fix current step on mount
  useEffect(() => {
    console.log(
      "[DEBUG] AvailableRidesScreen mounted. Current step:",
      currentStep
    );

    // Reset the current step first to ensure we're not stuck at a different step
    resetCurrentStep();

    // Then set it to the correct step for this screen
    setTimeout(() => {
      console.log("[DEBUG] Setting step to RIDES");
      goToStep(BookingStep.RIDES);
    }, 100);
  }, []);

  // States
  const [availableRides, setAvailableRides] = useState<RideData[]>([]);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("eta");
  const [isLoading, setIsLoading] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Direct navigation function as backup
  const directNavigateToConfirmation = () => {
    console.log("[DEBUG] Trying direct navigation to confirmation page");
    router.push("/(main)/client/booking/confirmation");
  };

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const mapHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 100],
    extrapolate: "clamp",
  });

  // Map ref
  const mapRef = useRef<MapView>(null);

  // Fetch available drivers from Convex
  const driversResult = useQuery(api.drivers.getAvailableDrivers, {
    latitude: bookingData.pickupLocation!.latitude,
    longitude: bookingData.pickupLocation!.longitude,
    minCapacity: bookingData.tripDetails.passengers,
  });

  // Extract and derive the data we need
  const isLoadingDrivers = driversResult === undefined;

  // Format driver data for the UI
  const formatDriverData = (convexDrivers: any[] | undefined) => {
    if (!convexDrivers || convexDrivers.length === 0) {
      return [];
    }

    return convexDrivers
      .filter((driver): driver is ConvexDriverData => driver !== null)
      .map((driver) => {
        // Extract first and last name from the driver's name
        const nameParts = driver.name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        // Extract brand and model from vehicle model
        const vehicleModelParts = driver.vehicle.model.split(" ");
        const brand = vehicleModelParts[0];
        const model = vehicleModelParts.slice(1).join(" ");

        // Extract ETA minutes from string like "10 min"
        const etaMinutes = parseInt(driver.eta.split(" ")[0], 10);

        // Extract base fare from price range
        const estimatedPrice = driver.priceRange.min;

        // Calculate price per km (approximation based on distance if available)
        const distanceKm = parseFloat(driver.distance.split(" ")[0]);
        const pricePerKm = Math.round((estimatedPrice / distanceKm) * 10) / 10;

        // Get the photo URL or storage ID
        const driverPhotoUrl =
          typeof driver.photo === "string" ? driver.photo : null;
        const driverPhotoId =
          typeof driver.photo === "object" ? driver.photo._id : undefined;

        // Get the vehicle image URL or storage ID
        const vehiclePhotoUrl =
          typeof driver.vehicle.image === "string"
            ? driver.vehicle.image
            : null;
        const vehiclePhotoId =
          typeof driver.vehicle.image === "object"
            ? driver.vehicle.image._id
            : undefined;

        return {
          id: driver.id,
          driver: {
            _id: driver.id as unknown as Id<"users">,
            firstName,
            lastName,
            rating: driver.rating,
            photoUrl: driverPhotoUrl,
            profileImage: driverPhotoId,
            languages: ["Arabic", "French"], // Default languages as they're not in the data
            userType: "partner" as const,
          },
          vehicle: {
            _id: driver.vehicle.id as unknown as Id<"vehicles">,
            brand,
            model,
            year: "2022", // Default as it's not in the data
            color: "Black", // Default as it's not in the data
            licensePlate: "ABC-" + Math.floor(Math.random() * 900 + 100), // Random license plate
            photoUrl: vehiclePhotoUrl,
            vehicleImage: vehiclePhotoId,
            capacity: driver.vehicle.capacity,
            features: ["Air Conditioning", "WiFi"], // Default features as they're not in the data
            images: [],
            pricePerKm,
            baseFare: estimatedPrice,
            category:
              (driver.vehicle.type as
                | "standard"
                | "premium"
                | "luxury"
                | "van") || "standard",
          },
          pricePerKm,
          estimatedPrice,
          eta: etaMinutes,
          distance: distanceKm,
        };
      });
  };

  // Transform the driver data into the format expected by the UI
  useEffect(() => {
    if (!isLoadingDrivers) {
      try {
        const formattedRides = formatDriverData(driversResult);
        setAvailableRides(formattedRides as unknown as RideData[]);
      } catch (error) {
        console.error("Error formatting driver data:", error);
        setAvailableRides([]);
      }
    }
  }, [driversResult, isLoadingDrivers]);

  // Sort rides
  useEffect(() => {
    if (availableRides.length === 0) return;

    let sortedRides = [...availableRides];

    switch (sortOption) {
      case "eta":
        sortedRides.sort((a, b) => a.eta - b.eta);
        break;
      case "price":
        sortedRides.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
        break;
      case "rating":
        // Handle undefined ratings by providing default values
        sortedRides.sort((a, b) => {
          const ratingA = a.driver.rating !== undefined ? a.driver.rating : 0;
          const ratingB = b.driver.rating !== undefined ? b.driver.rating : 0;
          return ratingB - ratingA;
        });
        break;
    }

    setAvailableRides([...sortedRides]);
  }, [sortOption, availableRides.length]);

  const handleSelectRide = (id: string) => {
    setSelectedRideId(id);
  };

  const handleContinue = () => {
    if (!selectedRideId) return;

    setIsLoading(true);
    console.log(
      "[DEBUG] handleContinue - Starting with selected ride ID:",
      selectedRideId
    );

    // Find the selected ride
    const selectedRide = availableRides.find(
      (ride) => ride.id === selectedRideId
    );

    if (selectedRide) {
      console.log(
        "[DEBUG] handleContinue - Found selected ride:",
        selectedRide.id
      );
      // Update context with vehicle and driver info
      const vehicleOption: VehicleOption = {
        id: selectedRide.vehicle._id,
        category: selectedRide.vehicle.category,
        name: `${selectedRide.vehicle.brand} ${selectedRide.vehicle.model}`,
        description: `${selectedRide.vehicle.year} ${selectedRide.vehicle.color}`,
        capacity: selectedRide.vehicle.capacity,
        imageUri: selectedRide.vehicle.photoUrl || "",
        pricePerKm: selectedRide.pricePerKm,
        baseFare: selectedRide.estimatedPrice,
        estimatedWaitTime: selectedRide.eta,
      };

      console.log("[DEBUG] handleContinue - Setting vehicle in context");
      setVehicle(vehicleOption);

      const driverProfile: DriverProfile = {
        id: selectedRide.driver._id,
        firstName: selectedRide.driver.firstName || "Driver",
        lastName: selectedRide.driver.lastName || "Name",
        profileImage: selectedRide.driver.photoUrl || undefined,
        rating: selectedRide.driver.rating || 4.5,
        languages: selectedRide.driver.languages || ["Arabic", "French"],
        vehicle: {
          brand: selectedRide.vehicle.brand,
          model: selectedRide.vehicle.model,
          year: selectedRide.vehicle.year,
          color: selectedRide.vehicle.color,
          licensePlate: selectedRide.vehicle.licensePlate,
          imageUri: selectedRide.vehicle.photoUrl || "",
        },
        eta: selectedRide.eta,
      };

      console.log("[DEBUG] handleContinue - Setting driver in context");
      setDriver(driverProfile);

      // Navigate to next step
      setTimeout(() => {
        setIsLoading(false);
        console.log(
          "[DEBUG] handleContinue - Current step before navigation:",
          currentStep
        );

        // Make sure we're on the RIDES step
        if (currentStep !== BookingStep.RIDES) {
          console.log(
            "[DEBUG] handleContinue - Fixing step to RIDES before navigation"
          );
          goToStep(BookingStep.RIDES);
          // After setting the step, wait a bit before going to next step
          setTimeout(() => {
            console.log(
              "[DEBUG] handleContinue - Now trying to navigate to next step"
            );
            try {
              goToNextStep();
            } catch (error) {
              console.error("[DEBUG] Error navigating to next step:", error);
              directNavigateToConfirmation();
            }
          }, 100);
        } else {
          // We're on the correct step, proceed with normal navigation
          console.log("[DEBUG] handleContinue - Calling goToNextStep normally");
          try {
            goToNextStep();
            console.log("[DEBUG] handleContinue - After goToNextStep call");
          } catch (error) {
            console.error(
              "[DEBUG] handleContinue - Error with goToNextStep:",
              error
            );
            console.log("[DEBUG] handleContinue - Trying direct navigation");
            directNavigateToConfirmation();
          }
        }
      }, 500);
    } else {
      console.log("[DEBUG] handleContinue - Selected ride not found");
      setIsLoading(false);
    }
  };

  const getSortDescription = () => {
    switch (sortOption) {
      case "eta":
        return "Fastest arrival";
      case "price":
        return "Lowest price";
      case "rating":
        return "Highest rated";
    }
  };

  const renderSortOptions = () => (
    <View style={styles.sortOptionsContainer}>
      <TouchableOpacity
        style={[
          styles.sortOption,
          sortOption === "eta" && {
            backgroundColor: theme.getColor("primary.brand") + "15",
          },
        ]}
        onPress={() => {
          setSortOption("eta");
          setShowSortOptions(false);
        }}
      >
        <Clock
          size={16}
          color={
            sortOption === "eta"
              ? theme.getColor("primary.brand")
              : theme.getColor("gray.500")
          }
        />
        <Typography
          variant="sm"
          weight={sortOption === "eta" ? "semibold" : "normal"}
          color={sortOption === "eta" ? "primary.brand" : "gray.700"}
          style={styles.sortOptionText}
        >
          Fastest arrival
        </Typography>
        {sortOption === "eta" && (
          <Check size={16} color={theme.getColor("primary.brand")} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sortOption,
          sortOption === "price" && {
            backgroundColor: theme.getColor("primary.brand") + "15",
          },
        ]}
        onPress={() => {
          setSortOption("price");
          setShowSortOptions(false);
        }}
      >
        <CreditCard
          size={16}
          color={
            sortOption === "price"
              ? theme.getColor("primary.brand")
              : theme.getColor("gray.500")
          }
        />
        <Typography
          variant="sm"
          weight={sortOption === "price" ? "semibold" : "normal"}
          color={sortOption === "price" ? "primary.brand" : "gray.700"}
          style={styles.sortOptionText}
        >
          Lowest price
        </Typography>
        {sortOption === "price" && (
          <Check size={16} color={theme.getColor("primary.brand")} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sortOption,
          sortOption === "rating" && {
            backgroundColor: theme.getColor("primary.brand") + "15",
          },
        ]}
        onPress={() => {
          setSortOption("rating");
          setShowSortOptions(false);
        }}
      >
        <Star
          size={16}
          color={
            sortOption === "rating"
              ? theme.getColor("primary.brand")
              : theme.getColor("gray.500")
          }
        />
        <Typography
          variant="sm"
          weight={sortOption === "rating" ? "semibold" : "normal"}
          color={sortOption === "rating" ? "primary.brand" : "gray.700"}
          style={styles.sortOptionText}
        >
          Highest rated
        </Typography>
        {sortOption === "rating" && (
          <Check size={16} color={theme.getColor("primary.brand")} />
        )}
      </TouchableOpacity>
    </View>
  );

  // Use the new component in your FlatList
  const renderRideItem = ({ item }: { item: RideData }) => {
    return (
      <RideItem
        item={item}
        isSelected={selectedRideId === item.id}
        onSelect={handleSelectRide}
        bookingData={bookingData}
      />
    );
  };

  // Improved empty state component
  const EmptyStateComponent = () => (
    <View style={styles.emptyContainer}>
      <Car size={48} color={theme.getColor("gray.400")} />
      <Typography variant="lg" weight="semibold" style={styles.emptyTitle}>
        {isLoadingDrivers ? "Loading vehicles..." : "No vehicles available"}
      </Typography>
      <Typography variant="md" color="gray.500" align="center">
        {isLoadingDrivers
          ? "Please wait while we find available vehicles for you."
          : "We couldn't find any available vehicles matching your requirements at this moment. Please try again later or modify your trip details."}
      </Typography>
      {!isLoadingDrivers && (
        <Button
          title="Modify Trip Details"
          onPress={() => router.push("/(main)/client/booking/details")}
          style={{ marginTop: 20 }}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Map */}
      <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
        <Map />
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Trip info card */}
        <View style={styles.tripInfoCard}>
          <View style={styles.locationContainer}>
            <View style={styles.locationItem}>
              <View
                style={[
                  styles.locationIconContainer,
                  { backgroundColor: theme.getColor("primary.brand") + "20" },
                ]}
              >
                <MapPin size={18} color={theme.getColor("primary.brand")} />
              </View>
              <Typography
                variant="sm"
                numberOfLines={1}
                style={styles.locationText}
              >
                {bookingData.pickupLocation!.address}
              </Typography>
            </View>

            <View style={styles.locationDivider} />

            <View style={styles.locationItem}>
              <View
                style={[
                  styles.locationIconContainer,
                  { backgroundColor: theme.getColor("error") + "20" },
                ]}
              >
                <Navigation size={18} color={theme.getColor("error")} />
              </View>
              <Typography
                variant="sm"
                numberOfLines={1}
                style={styles.locationText}
              >
                {bookingData.dropoffLocation!.address}
              </Typography>
            </View>
          </View>

          {routeEstimate && (
            <View style={styles.tripDetailsContainer}>
              <View style={styles.tripDetailItem}>
                <Typography variant="xs" color="gray.500">
                  Distance
                </Typography>
                <Typography variant="sm" weight="semibold">
                  {Math.round(routeEstimate.distance.value / 100) / 10} km
                </Typography>
              </View>
              <View style={styles.tripDetailItem}>
                <Typography variant="xs" color="gray.500">
                  Duration
                </Typography>
                <Typography variant="sm" weight="semibold">
                  {Math.round(routeEstimate.duration.value / 60)} min
                </Typography>
              </View>
              <View style={styles.tripDetailItem}>
                <Typography variant="xs" color="gray.500">
                  Passengers
                </Typography>
                <Typography variant="sm" weight="semibold">
                  {bookingData.tripDetails.passengers}{" "}
                  {bookingData.tripDetails.passengers === 1
                    ? "person"
                    : "people"}
                </Typography>
              </View>
            </View>
          )}
        </View>

        <View style={styles.sortingContainer}>
          <View style={styles.availableCount}>
            <Typography variant="md" weight="semibold">
              {isLoadingDrivers
                ? "Loading vehicles..."
                : `${availableRides.length} Available Vehicle${availableRides.length !== 1 ? "s" : ""}`}
            </Typography>
          </View>

          {availableRides.length > 0 && (
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortOptions(!showSortOptions)}
            >
              <Filter size={16} color={theme.getColor("gray.700")} />
              <Typography variant="sm" style={styles.sortButtonText}>
                {getSortDescription()}
              </Typography>
              <ChevronDown
                size={16}
                color={theme.getColor("gray.700")}
                style={{
                  transform: [{ rotate: showSortOptions ? "180deg" : "0deg" }],
                }}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort options dropdown */}
        {showSortOptions && renderSortOptions()}

        {/* Rides list */}
        <FlatList
          data={availableRides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Since it's nested in ScrollView
          contentContainerStyle={styles.ridesList}
          ListEmptyComponent={<EmptyStateComponent />}
        />
      </Animated.ScrollView>
      {/* Continue button */}
      {selectedRideId && (
        <View style={styles.continueButtonContainer}>
          <Button
            title="Continue"
            onPress={() => {
              if (!selectedRideId) return;

              setIsLoading(true);
              console.log(
                "[DEBUG] Continue button pressed with ride:",
                selectedRideId
              );

              // Find the selected ride
              const selectedRide = availableRides.find(
                (ride) => ride.id === selectedRideId
              );

              if (selectedRide) {
                // Update context with vehicle and driver info
                const vehicleOption: VehicleOption = {
                  id: selectedRide.vehicle._id,
                  category: selectedRide.vehicle.category,
                  name: `${selectedRide.vehicle.brand} ${selectedRide.vehicle.model}`,
                  description: `${selectedRide.vehicle.year} ${selectedRide.vehicle.color}`,
                  capacity: selectedRide.vehicle.capacity,
                  imageUri: selectedRide.vehicle.photoUrl || "",
                  pricePerKm: selectedRide.pricePerKm,
                  baseFare: selectedRide.estimatedPrice,
                  estimatedWaitTime: selectedRide.eta,
                };

                setVehicle(vehicleOption);

                const driverProfile: DriverProfile = {
                  id: selectedRide.driver._id,
                  firstName: selectedRide.driver.firstName || "Driver",
                  lastName: selectedRide.driver.lastName || "Name",
                  profileImage: selectedRide.driver.photoUrl || undefined,
                  rating: selectedRide.driver.rating || 4.5,
                  languages: selectedRide.driver.languages || [
                    "Arabic",
                    "French",
                  ],
                  vehicle: {
                    brand: selectedRide.vehicle.brand,
                    model: selectedRide.vehicle.model,
                    year: selectedRide.vehicle.year,
                    color: selectedRide.vehicle.color,
                    licensePlate: selectedRide.vehicle.licensePlate,
                    imageUri: selectedRide.vehicle.photoUrl || "",
                  },
                  eta: selectedRide.eta,
                };

                setDriver(driverProfile);

                // Direct navigation is the most reliable approach
                setTimeout(() => {
                  setIsLoading(false);
                  console.log(
                    "[DEBUG] Directly navigating to confirmation screen"
                  );
                  router.push("/(main)/client/booking/confirmation");
                }, 500);
              } else {
                setIsLoading(false);
                console.log("[DEBUG] Selected ride not found");
              }
            }}
            disabled={!selectedRideId || isLoading}
            loading={isLoading}
            rightIcon={<ArrowRight />}
            style={styles.continueButton}
          />
        </View>
      )}
    </View>
  );
}

// Create a separate RideItem component that can use hooks
const RideItem = React.memo(
  ({
    item,
    isSelected,
    onSelect,
    bookingData,
  }: {
    item: RideData;
    isSelected: boolean;
    onSelect: (id: string) => void;
    bookingData: any;
  }) => {
    const getStorageUrl = useMutation(api.storage.getUrl);
    const theme = useTheme();
    const { totalTrips } = useTotalTrips(
      item.driver && item.driver._id ? (item.driver._id as Id<"users">) : null
    );

    // These hooks are now in a proper component, not inside a render function
    const [driverImageSource, setDriverImageSource] = useState<any>(
      item.driver.photoUrl ? { uri: item.driver.photoUrl } : undefined
    );

    const [vehicleImageSource, setVehicleImageSource] = useState<any>(
      item.vehicle.photoUrl ? { uri: item.vehicle.photoUrl } : undefined
    );

    // Use effect to load storage URLs when the component mounts
    useEffect(() => {
      // Load driver image if available
      if (item.driver.profileImage) {
        getStorageUrl({ storageId: item.driver.profileImage })
          .then((url) => {
            if (url) setDriverImageSource({ uri: url });
          })
          .catch((err) => console.error("Failed to load driver image:", err));
      }

      // Load vehicle image if available
      if (item.vehicle.vehicleImage) {
        getStorageUrl({ storageId: item.vehicle.vehicleImage })
          .then((url) => {
            if (url) setVehicleImageSource({ uri: url });
          })
          .catch((err) => console.error("Failed to load vehicle image:", err));
      }
    }, [item.driver.profileImage, item.vehicle.vehicleImage]);

    // Build driver initials if available
    const driverInitials = React.useMemo(() => {
      const firstName = item.driver.firstName || "";
      const lastName = item.driver.lastName || "";
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }, [item.driver.firstName, item.driver.lastName]);

    // Format driver name for display
    const driverName = React.useMemo(() => {
      const firstName = item.driver.firstName || "";
      const lastName = item.driver.lastName || "";
      return `${firstName} ${lastName}`.trim() || "Driver";
    }, [item.driver.firstName, item.driver.lastName]);

    // Format rating for display
    const driverRating = React.useMemo(() => {
      const rating = item.driver.rating || 0;
      return rating.toFixed(1);
    }, [item.driver.rating]);

    return (
      <TouchableOpacity
        style={[
          styles.rideCard,
          isSelected && {
            borderColor: theme.getColor("primary.brand"),
            borderWidth: 2,
          },
        ]}
        onPress={() => onSelect(item.id)}
        activeOpacity={0.8}
      >
        {/* Driver info row */}
        <View style={styles.driverInfoRow}>
          <View style={styles.driverAvatarContainer}>
            {driverImageSource ? (
              <Image source={driverImageSource} style={styles.driverAvatar} />
            ) : (
              <View
                style={[
                  styles.driverAvatarPlaceholder,
                  { backgroundColor: theme.getColor("primary.brand") + "20" },
                ]}
              >
                <Typography
                  variant="md"
                  weight="semibold"
                  color="primary.brand"
                >
                  {driverInitials}
                </Typography>
              </View>
            )}
          </View>

          <View style={styles.driverDetails}>
            <Typography variant="md" weight="semibold">
              {driverName}
            </Typography>

            <View style={styles.ratingContainer}>
              <Star
                size={14}
                color={theme.getColor("warning")}
                fill={theme.getColor("warning")}
              />
              <Typography variant="sm" style={styles.ratingText}>
                {driverRating}
              </Typography>
              <Typography variant="xs" color="gray.500">
                ({totalTrips}+ trips)
              </Typography>
            </View>
          </View>

          <View style={styles.etaContainer}>
            <Clock size={14} color={theme.getColor("gray.500")} />
            <Typography variant="sm" weight="semibold" style={styles.etaText}>
              {item.eta} min
            </Typography>
          </View>
        </View>

        {/* Vehicle info row */}
        <View style={styles.vehicleInfoRow}>
          <View style={styles.vehicleImageContainer}>
            {vehicleImageSource ? (
              <Image
                source={vehicleImageSource}
                style={styles.vehicleImage}
                resizeMode="contain"
              />
            ) : (
              <Car size={40} color={theme.getColor("gray.400")} />
            )}
          </View>

          <View style={styles.vehicleDetails}>
            <Typography variant="md">
              {item.vehicle.brand} {item.vehicle.model}
            </Typography>

            <Typography variant="sm" color="gray.500">
              {item.vehicle.color} • {item.vehicle.licensePlate}
            </Typography>

            <View style={styles.capacityContainer}>
              <Users size={14} color={theme.getColor("gray.500")} />
              <Typography
                variant="sm"
                color="gray.500"
                style={styles.capacityText}
              >
                {item.vehicle.capacity} seats
              </Typography>

              <Briefcase size={14} color={theme.getColor("gray.500")} />
              <Typography
                variant="sm"
                color="gray.500"
                style={styles.capacityText}
              >
                {bookingData.tripDetails.luggage}{" "}
                {bookingData.tripDetails.luggage === 1 ? "luggage" : "luggages"}
              </Typography>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Typography variant="md" weight="bold" color="primary.brand">
              {item.estimatedPrice} MAD
            </Typography>
            <Typography variant="xs" color="gray.500">
              {item.pricePerKm} MAD/km
            </Typography>
          </View>
        </View>

        {/* Vehicle features */}
        {item.vehicle.features && item.vehicle.features.length > 0 && (
          <View style={styles.featuresContainer}>
            {item.vehicle.features.map((feature, index) => (
              <View
                key={index}
                style={[
                  styles.featureTag,
                  { backgroundColor: theme.getColor("gray.100") },
                ]}
              >
                <Typography variant="xs" color="gray.700">
                  {feature}
                </Typography>
              </View>
            ))}
          </View>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <View
            style={[
              styles.selectedIndicator,
              { backgroundColor: theme.getColor("primary.brand") },
            ]}
          >
            <Check size={16} color="white" />
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    width: 40,
  },
  mapContainer: {
    width: "100%",
    overflow: "hidden",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  tripInfoCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationText: {
    flex: 1,
  },
  locationDivider: {
    height: 16,
    width: 1,
    backgroundColor: "#E5E7EB",
    marginLeft: 16,
  },
  tripDetailsContainer: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  tripDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  availableCount: {
    flex: 1,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sortButtonText: {
    marginHorizontal: 8,
  },
  sortOptionsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: "hidden",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sortOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  ridesList: {
    paddingBottom: 80,
  },
  rideCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  driverAvatarContainer: {
    marginRight: 12,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  driverAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  driverDetails: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    marginLeft: 4,
    marginRight: 6,
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  etaText: {
    marginLeft: 4,
  },
  vehicleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  vehicleImageContainer: {
    width: 50,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  vehicleDetails: {
    flex: 1,
  },
  capacityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  capacityText: {
    marginLeft: 4,
    marginRight: 12,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  continueButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  continueButton: {
    width: "100%",
  },
});
