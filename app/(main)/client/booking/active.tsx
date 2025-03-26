// app/(main)/booking/active.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
  Platform,
  Animated,
  Modal,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Share2,
  Navigation,
  MapPin,
  Clock,
  Car,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Flag,
  Shield,
  Star,
  Heart,
  BookOpen,
  Info,
  Menu,
  X,
  Check,
} from "lucide-react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { TripStatus, BookingStep } from "@/types/booking";
import { useBooking } from "@/context/BookingContext";
import MapViewDirections from "react-native-maps-directions";
import config from "@/config";
import { useTotalTrips } from "@/hooks/useTotalTrips";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { Id } from "@/convex/_generated/dataModel";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Custom map style
const CUSTOM_MAP_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

export default function ActiveTripScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    bookingData,
    updateStatus,
    routeEstimate,
    cancelBooking,
    completeTrip,
    goToStep,
    currentStep,
  } = useBooking();
  const { totalTrips } = useTotalTrips(
    bookingData.driver ? bookingData.driver.id : null
  );
  const { user } = useAuth();
  const submitReviewMutation = useMutation(api.reviews.submitReview);

  // Make sure we're on the correct step (ACTIVE) when this screen mounts
  useEffect(() => {
    console.log("[DEBUG] ActiveScreen mounted with current step:", currentStep);

    // Set the current step to ACTIVE to ensure proper navigation
    if (currentStep !== BookingStep.ACTIVE) {
      console.log("[DEBUG] Setting step to ACTIVE");
      goToStep(BookingStep.ACTIVE);
    }
  }, []);

  // States
  const [mapRegion, setMapRegion] = useState({
    latitude: bookingData.pickupLocation!.latitude,
    longitude: bookingData.pickupLocation!.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  const [driverLocation, setDriverLocation] = useState({
    latitude: bookingData.pickupLocation!.latitude - 0.01,
    longitude: bookingData.pickupLocation!.longitude - 0.01,
  });
  const [tripData, setTripData] = useState<{
    distance: number;
    duration: number;
    cost: number;
    startTime: Date;
    endTime: Date | null;
  }>({
    distance: 0,
    duration: 0,
    cost: bookingData.selectedVehicle?.baseFare || 75,
    startTime: new Date(),
    endTime: null,
  });
  const [isRatingVisible, setIsRatingVisible] = useState(false);
  const [isSafetyMenuVisible, setIsSafetyMenuVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [rating, setRating] = useState(5);
  const [experienceRating, setExperienceRating] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [emergencyPulsing, setEmergencyPulsing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation refs
  const mapRef = useRef<MapView>(null);
  const statusUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(100)).current;

  // Trip simulation
  useEffect(() => {
    let step = 0;

    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start emergency button pulse animation
    startPulseAnimation();

    // Mock driver approaching
    if (bookingData.status === TripStatus.DRIVER_MATCHED) {
      updateStatus(TripStatus.DRIVER_APPROACHING);

      // Simulate driver location updates
      statusUpdateInterval.current = setInterval(() => {
        step += 1;

        // Update driver location (moving towards pickup)
        const newDriverLocation = {
          latitude:
            driverLocation.latitude +
            (bookingData.pickupLocation!.latitude - driverLocation.latitude) *
              0.1,
          longitude:
            driverLocation.longitude +
            (bookingData.pickupLocation!.longitude - driverLocation.longitude) *
              0.1,
        };

        setDriverLocation(newDriverLocation);

        // After 5 steps, driver arrives
        if (step >= 5) {
          clearInterval(statusUpdateInterval.current!);
          updateStatus(TripStatus.DRIVER_ARRIVED);

          // After 5 seconds, trip starts
          setTimeout(() => {
            const tripStartTime = new Date();
            updateStatus(TripStatus.IN_PROGRESS);
            setTripData((prev) => ({
              ...prev,
              startTime: tripStartTime,
            }));

            // Start the trip simulation
            let tripStep = 0;
            const totalSteps = 10;
            statusUpdateInterval.current = setInterval(() => {
              tripStep += 1;

              // Update driver location (moving towards dropoff)
              const newTripLocation = {
                latitude:
                  bookingData.pickupLocation!.latitude +
                  (bookingData.dropoffLocation!.latitude -
                    bookingData.pickupLocation!.latitude) *
                    (tripStep / totalSteps),
                longitude:
                  bookingData.pickupLocation!.longitude +
                  (bookingData.dropoffLocation!.longitude -
                    bookingData.pickupLocation!.longitude) *
                    (tripStep / totalSteps),
              };

              setDriverLocation(newTripLocation);

              // Update trip progress data
              const distance =
                (routeEstimate?.distance.value || 10) * (tripStep / totalSteps);
              const duration =
                (routeEstimate?.duration.value || 20) * (tripStep / totalSteps);
              const additionalCost = Math.floor(
                distance * (bookingData.selectedVehicle?.pricePerKm || 7)
              );

              setTripData((prev) => ({
                ...prev,
                distance,
                duration,
                cost:
                  (bookingData.selectedVehicle?.baseFare || 75) +
                  additionalCost,
              }));

              // After all steps, trip completes
              if (tripStep >= totalSteps) {
                clearInterval(statusUpdateInterval.current!);
                const tripEndTime = new Date();
                updateStatus(TripStatus.COMPLETED);
                setTripData((prev) => ({
                  ...prev,
                  endTime: tripEndTime,
                }));

                // Show rating modal after trip completes
                setTimeout(() => {
                  setIsRatingVisible(true);
                }, 1000);
              }
            }, 3000);
          }, 5000);
        }
      }, 2000);
    }

    // Cleanup on unmount
    return () => {
      if (statusUpdateInterval.current) {
        clearInterval(statusUpdateInterval.current);
      }
    };
  }, []);

  // Adjust map to show all relevant points
  useEffect(() => {
    adjustMapToShowMarkers();
  }, [driverLocation, bookingData.status]);

  // Pulse animation for emergency button
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Switch to pulsing emergency animation
  useEffect(() => {
    if (emergencyPulsing) {
      pulseAnim.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      startPulseAnimation();
    }
  }, [emergencyPulsing]);

  const adjustMapToShowMarkers = () => {
    if (!mapRef.current) return;

    const markers = [];

    // Always include pickup and dropoff
    markers.push({
      latitude: bookingData.pickupLocation?.latitude || 0,
      longitude: bookingData.pickupLocation?.longitude || 0,
    });

    markers.push({
      latitude: bookingData.dropoffLocation?.latitude || 0,
      longitude: bookingData.dropoffLocation?.longitude || 0,
    });

    // Include driver location if available
    if (driverLocation) {
      markers.push({
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
      });
    }

    // Fit map to show all markers
    if (markers.length > 0) {
      mapRef.current.fitToCoordinates(markers, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    }
  };

  const handleBack = () => {
    Alert.alert(
      "Leave Trip View",
      "Do you want to go back to the home screen? Your trip will continue in the background.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Go Back", onPress: () => router.navigate("/") },
      ]
    );
  };

  const handleCallDriver = () => {
    if (!bookingData.driver) return;

    Linking.openURL(`tel:+212612345678`); // Replace with actual phone number
  };

  const handleMessageDriver = () => {
    if (!bookingData.driver) return;

    // This would be replaced with actual messaging functionality
    Alert.alert(
      "Message Driver",
      `Open chat with ${bookingData.driver.firstName} ${bookingData.driver.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Chat", onPress: () => console.log("Open chat") },
      ]
    );
  };

  const handleShareTrip = () => {
    if (Platform.OS === "android") {
      Linking.openURL(
        `sms:?body=I'm on my way! Track my trip here: https://tripmingle.app/track/12345`
      );
    } else {
      Linking.openURL(
        `sms:&body=I'm on my way! Track my trip here: https://tripmingle.app/track/12345`
      );
    }
  };

  const handleEmergency = () => {
    setEmergencyPulsing(true);
    Alert.alert(
      "Emergency Help",
      "Do you need emergency assistance?",
      [
        {
          text: "Cancel",
          onPress: () => setEmergencyPulsing(false),
          style: "cancel",
        },
        {
          text: "Call Emergency Services",
          onPress: () => {
            setEmergencyPulsing(false);
            Linking.openURL("tel:911");
          },
          style: "destructive",
        },
        {
          text: "Contact TripMingle Support",
          onPress: () => {
            setEmergencyPulsing(false);
            Linking.openURL("tel:+212522000000"); // Replace with actual support number
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleCancelTrip = async () => {
    Alert.alert(
      "Cancel Trip",
      "Are you sure you want to cancel this trip? Cancellation fees may apply.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              // The cancelBooking function now handles resetting the store
              const success = await cancelBooking("User cancelled");
              if (!success) {
                Alert.alert(
                  "Error",
                  "Unable to cancel trip. Please try again."
                );
              }
            } catch (error) {
              console.error("Error cancelling trip:", error);
              Alert.alert("Error", "Unable to cancel trip. Please try again.");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleReportIssue = () => {
    setIsSafetyMenuVisible(false);
    setIsReportModalVisible(true);
  };

  const submitReport = () => {
    if (!reportReason) {
      Alert.alert("Error", "Please select a reason for your report");
      return;
    }

    // This would be replaced with actual report submission
    Alert.alert(
      "Report Submitted",
      "Thank you for your report. Our team will review it and take appropriate action.",
      [{ text: "OK", onPress: () => setIsReportModalVisible(false) }]
    );
  };

  const submitRating = async () => {
    if (!experienceRating) {
      Alert.alert("Error", "Please select your overall experience");
      return;
    }

    if (rating < 1) {
      Alert.alert("Error", "Please select a star rating");
      return;
    }

    if (!user || !bookingData.driver || !bookingData.bookingId) {
      Alert.alert(
        "Error",
        "Unable to submit rating. Missing required information."
      );
      return;
    }

    setIsLoading(true);
    try {
      // Submit the driver rating using the star rating
      await submitReviewMutation({
        tripId: bookingData.bookingId as unknown as Id<"trips">,
        reviewerId: user._id,
        revieweeId: bookingData.driver.id,
        rating: rating, // Using the star rating (1-5)
        comment: ratingComment, // Optional comment
      });

      // Show success message
      Alert.alert(
        "Rating Submitted",
        "Thank you for your feedback! Your input helps us improve our service.",
        [
          {
            text: "OK",
            onPress: async () => {
              setIsRatingVisible(false);

              // Complete the trip and reset the store
              try {
                await completeTrip();
              } catch (error) {
                console.error("Error completing trip:", error);
              }

              router.navigate("/");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Unable to submit your rating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} MAD`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const getTimeBetween = (start: Date, end: Date | null) => {
    if (!end) return "0 min";
    const diffMs = end.getTime() - start.getTime();
    const diffMin = Math.round(diffMs / 60000);
    return formatDuration(diffMin);
  };

  const getStatusIcon = () => {
    const { status } = bookingData;

    switch (status) {
      case TripStatus.DRIVER_APPROACHING:
        return <Car size={22} color={theme.getColor("primary.brand")} />;
      case TripStatus.DRIVER_ARRIVED:
        return <MapPin size={22} color={theme.getColor("success")} />;
      case TripStatus.IN_PROGRESS:
        return <Navigation size={22} color={theme.getColor("primary.brand")} />;
      case TripStatus.COMPLETED:
        return <CheckCircle size={22} color={theme.getColor("success")} />;
      case TripStatus.CANCELLED:
        return <AlertTriangle size={22} color={theme.getColor("error")} />;
      default:
        return <Clock size={22} color={theme.getColor("gray.500")} />;
    }
  };

  const getStatusText = () => {
    const { status } = bookingData;

    switch (status) {
      case TripStatus.DRIVER_APPROACHING:
        return `${bookingData.driver?.firstName} is on the way`;
      case TripStatus.DRIVER_ARRIVED:
        return `${bookingData.driver?.firstName} has arrived`;
      case TripStatus.IN_PROGRESS:
        return "On the way to destination";
      case TripStatus.COMPLETED:
        return "Trip completed";
      case TripStatus.CANCELLED:
        return "Trip cancelled";
      default:
        return "Preparing your trip";
    }
  };

  const getStatusDescription = () => {
    const { status } = bookingData;

    switch (status) {
      case TripStatus.DRIVER_APPROACHING:
        return `Arriving in ${bookingData.driver?.eta} minutes`;
      case TripStatus.DRIVER_ARRIVED:
        return "Your driver is waiting for you";
      case TripStatus.IN_PROGRESS:
        return `${Math.ceil(tripData.duration)} minutes to destination`;
      case TripStatus.COMPLETED:
        return "We hope you enjoyed your trip!";
      case TripStatus.CANCELLED:
        return "This trip has been cancelled";
      default:
        return "";
    }
  };

  const getEtaColor = () => {
    const { status } = bookingData;

    switch (status) {
      case TripStatus.DRIVER_APPROACHING:
        return theme.getColor("primary.brand");
      case TripStatus.DRIVER_ARRIVED:
        return theme.getColor("success");
      case TripStatus.IN_PROGRESS:
        return theme.getColor("primary.brand");
      case TripStatus.COMPLETED:
        return theme.getColor("success");
      default:
        return theme.getColor("gray.500");
    }
  };

  const isActiveTrip =
    bookingData.status === TripStatus.DRIVER_APPROACHING ||
    bookingData.status === TripStatus.DRIVER_ARRIVED ||
    bookingData.status === TripStatus.IN_PROGRESS;

  const renderEmoji = (
    index: number,
    selected: boolean,
    onSelect: () => void
  ) => {
    const emojis = ["😠", "😕", "😐", "🙂", "😄"];
    const labels = ["Terrible", "Bad", "Okay", "Good", "Great"];

    return (
      <TouchableOpacity
        style={[
          styles.emojiButton,
          selected && { borderColor: theme.getColor("primary.brand") },
        ]}
        onPress={onSelect}
      >
        <Typography variant="xl">{emojis[index]}</Typography>
        <Typography
          variant="xs"
          color={selected ? "primary.brand" : "gray.500"}
          weight={selected ? "semibold" : "normal"}
        >
          {labels[index]}
        </Typography>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        customMapStyle={CUSTOM_MAP_STYLE}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Pickup marker */}
        <Marker
          coordinate={{
            latitude: bookingData.pickupLocation!.latitude,
            longitude: bookingData.pickupLocation!.longitude,
          }}
          title="Pickup"
          description={bookingData.pickupLocation!.address}
        >
          <View style={styles.markerContainer}>
            <MapPin size={24} color={theme.getColor("primary.brand")} />
          </View>
        </Marker>

        {/* Dropoff marker */}
        <Marker
          coordinate={{
            latitude: bookingData.dropoffLocation!.latitude,
            longitude: bookingData.dropoffLocation!.longitude,
          }}
          title="Destination"
          description={bookingData.dropoffLocation!.address}
        >
          <View style={styles.markerContainer}>
            <Navigation size={24} color={theme.getColor("error")} />
          </View>
        </Marker>

        {/* Driver marker */}
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
            }}
            title={
              bookingData.driver
                ? `${bookingData.driver.firstName}'s car`
                : "Driver"
            }
            description={
              bookingData.driver
                ? `${bookingData.driver.vehicle.brand} ${bookingData.driver.vehicle.model}`
                : ""
            }
          >
            <View
              style={[
                styles.driverMarker,
                { backgroundColor: theme.getColor("primary.brand") },
              ]}
            >
              <Typography variant="xs" weight="bold" color="primary.lightest">
                🚕
              </Typography>
            </View>
          </Marker>
        )}

        <MapViewDirections
          origin={{
            latitude: bookingData.pickupLocation!.latitude,
            longitude: bookingData.pickupLocation!.longitude,
          }}
          destination={{
            latitude: bookingData.dropoffLocation!.latitude,
            longitude: bookingData.dropoffLocation!.longitude,
          }}
          apikey={config.GOOGLE_PLACES_API_KEY}
          strokeWidth={5}
          strokeColor="#00a8e8"
          // onReady={onRouteFetched}
        />
      </MapView>

      {/* Header with back button */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, opacity: fadeAnim },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>

        {bookingData.status === TripStatus.IN_PROGRESS && (
          <View style={styles.tripProgress}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.getColor("primary.brand") + "20" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.getColor("primary.brand"),
                    width: `${
                      ((driverLocation.latitude -
                        bookingData.pickupLocation!.latitude) /
                        (bookingData.dropoffLocation!.latitude -
                          bookingData.pickupLocation!.latitude)) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            <Typography
              variant="xs"
              color="primary.lightest"
              style={styles.progressText}
            >
              {formatCurrency(tripData.cost)} •{" "}
              {formatDuration(tripData.duration)} remaining
            </Typography>
          </View>
        )}
      </Animated.View>

      {/* Safety buttons row */}
      <Animated.View
        style={[
          styles.safetyButtonsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.emergencyButton,
            {
              transform: [{ scale: pulseAnim }],
              backgroundColor: emergencyPulsing
                ? theme.getColor("error")
                : "rgba(0, 0, 0, 0.6)",
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleEmergency}
            style={styles.emergencyButtonInner}
          >
            {emergencyPulsing ? (
              <AlertCircle size={20} color="white" />
            ) : (
              <Shield size={20} color="white" />
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={[
            styles.safetyMenuButton,
            { backgroundColor: theme.getColor("warning") },
          ]}
          onPress={() => setIsSafetyMenuVisible(true)}
        >
          <Menu size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Trip status card */}
      <Animated.View
        style={[
          styles.statusCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <View style={styles.statusCardContent}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconAndText}>
              <View
                style={[
                  styles.statusIconContainer,
                  { backgroundColor: getEtaColor() + "15" },
                ]}
              >
                {getStatusIcon()}
              </View>
              <View>
                <Typography variant="md" weight="semibold">
                  {getStatusText()}
                </Typography>
                <Typography variant="sm" color="gray.500">
                  {getStatusDescription()}
                </Typography>
              </View>
            </View>

            {bookingData.driver && isActiveTrip && (
              <TouchableOpacity
                style={[
                  styles.driverAvatar,
                  { borderColor: theme.getColor("primary.brand") },
                ]}
                onPress={() => setIsProfileVisible(!isProfileVisible)}
              >
                <Typography
                  variant="md"
                  weight="semibold"
                  color="primary.brand"
                >
                  {bookingData.driver.firstName[0]}
                  {bookingData.driver.lastName[0]}
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          {isProfileVisible && bookingData.driver && (
            <View style={styles.driverInfo}>
              <View style={styles.driverDetail}>
                <Typography variant="sm" color="gray.500">
                  Driver
                </Typography>
                <Typography variant="md" weight="semibold">
                  {bookingData.driver.firstName} {bookingData.driver.lastName}
                </Typography>
              </View>

              <View style={styles.driverDetail}>
                <Typography variant="sm" color="gray.500">
                  Vehicle
                </Typography>
                <Typography variant="md" weight="medium">
                  {bookingData.driver.vehicle.brand}{" "}
                  {bookingData.driver.vehicle.model} •{" "}
                  {bookingData.driver.vehicle.color}
                </Typography>
              </View>

              <View style={styles.driverDetail}>
                <Typography variant="sm" color="gray.500">
                  License Plate
                </Typography>
                <Typography variant="md" weight="semibold">
                  {bookingData.driver.vehicle.licensePlate}
                </Typography>
              </View>

              <View style={styles.driverRating}>
                <Typography variant="sm" color="gray.500">
                  Rating
                </Typography>
                <View style={styles.ratingDisplay}>
                  <Star
                    size={16}
                    color={theme.getColor("warning")}
                    fill={theme.getColor("warning")}
                  />
                  <Typography
                    variant="md"
                    weight="medium"
                    style={styles.ratingText}
                  >
                    {bookingData.driver.rating.toFixed(1)}
                  </Typography>
                  <Typography variant="sm" color="gray.500">
                    ({totalTrips} trips)
                  </Typography>
                </View>
              </View>
            </View>
          )}

          {/* Current location during a trip */}
          {bookingData.status === TripStatus.IN_PROGRESS && (
            <View style={styles.currentLocation}>
              <View style={styles.locationPill}>
                <Navigation size={16} color={theme.getColor("primary.brand")} />
                <Typography
                  variant="sm"
                  numberOfLines={1}
                  style={styles.locationText}
                >
                  En route to {bookingData.dropoffLocation!.address}
                </Typography>
              </View>
            </View>
          )}

          {/* Trip completed buttons */}
          {bookingData.status === TripStatus.COMPLETED && !isRatingVisible && (
            <View style={styles.completedActions}>
              <Button
                title="Rate Your Experience"
                onPress={() => setIsRatingVisible(true)}
                style={styles.rateButton}
                rightIcon={<Star size={18} />}
              />
              <View style={styles.tripStats}>
                <View style={styles.statItem}>
                  <Typography variant="sm" color="gray.500">
                    Distance
                  </Typography>
                  <Typography variant="md" weight="semibold">
                    {tripData.distance.toFixed(1)} km
                  </Typography>
                </View>
                <View style={styles.statItem}>
                  <Typography variant="sm" color="gray.500">
                    Duration
                  </Typography>
                  <Typography variant="md" weight="semibold">
                    {getTimeBetween(tripData.startTime, tripData.endTime)}
                  </Typography>
                </View>
                <View style={styles.statItem}>
                  <Typography variant="sm" color="gray.500">
                    Total
                  </Typography>
                  <Typography
                    variant="md"
                    weight="semibold"
                    color="primary.brand"
                  >
                    {formatCurrency(tripData.cost)}
                  </Typography>
                </View>
              </View>
            </View>
          )}

          {/* Action buttons */}
          {isActiveTrip && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCallDriver}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.getColor("success") + "15" },
                  ]}
                >
                  <Phone size={18} color={theme.getColor("success")} />
                </View>
                <Typography variant="xs" weight="medium">
                  Call
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleMessageDriver}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.getColor("primary.brand") + "15" },
                  ]}
                >
                  <MessageSquare
                    size={18}
                    color={theme.getColor("primary.brand")}
                  />
                </View>
                <Typography variant="xs" weight="medium">
                  Message
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShareTrip}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: theme.getColor("info") + "15" },
                  ]}
                >
                  <Share2 size={18} color={theme.getColor("info")} />
                </View>
                <Typography variant="xs" weight="medium">
                  Share
                </Typography>
              </TouchableOpacity>

              {(bookingData.status === TripStatus.DRIVER_APPROACHING ||
                bookingData.status === TripStatus.DRIVER_ARRIVED) && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleCancelTrip}
                  disabled={isCancelling}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: theme.getColor("error") + "15" },
                    ]}
                  >
                    <AlertTriangle size={18} color={theme.getColor("error")} />
                  </View>
                  <Typography
                    variant="xs"
                    weight="medium"
                    color={isCancelling ? "gray.400" : "text"}
                  >
                    Cancel
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Animated.View>

      {/* Safety Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSafetyMenuVisible}
        onRequestClose={() => setIsSafetyMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="lg" weight="semibold">
                Safety & Support
              </Typography>
              <TouchableOpacity
                onPress={() => setIsSafetyMenuVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color={theme.getColor("gray.500")} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuScroll}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEmergency}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: theme.getColor("error") + "15" },
                  ]}
                >
                  <Shield size={24} color={theme.getColor("error")} />
                </View>
                <View style={styles.menuText}>
                  <Typography variant="md" weight="semibold">
                    Emergency Help
                  </Typography>
                  <Typography variant="sm" color="gray.500">
                    Call emergency services or TripMingle support
                  </Typography>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleReportIssue}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: theme.getColor("warning") + "15" },
                  ]}
                >
                  <Flag size={24} color={theme.getColor("warning")} />
                </View>
                <View style={styles.menuText}>
                  <Typography variant="md" weight="semibold">
                    Report an Issue
                  </Typography>
                  <Typography variant="sm" color="gray.500">
                    Report a problem with your current trip
                  </Typography>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: theme.getColor("primary.brand") + "15" },
                  ]}
                >
                  <Phone size={24} color={theme.getColor("primary.brand")} />
                </View>
                <View style={styles.menuText}>
                  <Typography variant="md" weight="semibold">
                    Contact Support
                  </Typography>
                  <Typography variant="sm" color="gray.500">
                    Speak with TripMingle customer service
                  </Typography>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: theme.getColor("info") + "15" },
                  ]}
                >
                  <Info size={24} color={theme.getColor("info")} />
                </View>
                <View style={styles.menuText}>
                  <Typography variant="md" weight="semibold">
                    Safety Tips
                  </Typography>
                  <Typography variant="sm" color="gray.500">
                    View tips for a safe ride experience
                  </Typography>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: theme.getColor("success") + "15" },
                  ]}
                >
                  <BookOpen size={24} color={theme.getColor("success")} />
                </View>
                <View style={styles.menuText}>
                  <Typography variant="md" weight="semibold">
                    Trip Policies
                  </Typography>
                  <Typography variant="sm" color="gray.500">
                    View cancellation and refund policies
                  </Typography>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setIsSafetyMenuVisible(false)}
              variant="secondary"
              style={styles.menuCloseButton}
            />
          </View>
        </View>
      </Modal>

      {/* Report Issue Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isReportModalVisible}
        onRequestClose={() => setIsReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="lg" weight="semibold">
                Report an Issue
              </Typography>
              <TouchableOpacity
                onPress={() => setIsReportModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={20} color={theme.getColor("gray.500")} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reportForm}>
              <Typography variant="md" weight="medium" style={styles.formLabel}>
                What's the problem?
              </Typography>

              {[
                "Driver behavior",
                "Vehicle issues",
                "Route problems",
                "Safety concerns",
                "Other",
              ].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonOption,
                    reportReason === reason && {
                      borderColor: theme.getColor("primary.brand"),
                      backgroundColor: theme.getColor("primary.brand") + "10",
                    },
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <Typography
                    variant="md"
                    color={reportReason === reason ? "primary.brand" : "text"}
                  >
                    {reason}
                  </Typography>
                  {reportReason === reason && (
                    <View
                      style={[
                        styles.checkmark,
                        { backgroundColor: theme.getColor("primary.brand") },
                      ]}
                    >
                      <Check size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              <Typography variant="md" weight="medium" style={styles.formLabel}>
                Tell us more (optional)
              </Typography>

              <TextInput
                style={[
                  styles.textArea,
                  { borderColor: theme.getColor("gray.300") },
                ]}
                placeholder="Please provide any additional details about the issue"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={reportDetails}
                onChangeText={setReportDetails}
              />

              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  onPress={() => setIsReportModalVisible(false)}
                  variant="secondary"
                  style={styles.formButton}
                />
                <Button
                  title="Submit Report"
                  onPress={submitReport}
                  style={styles.formButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRatingVisible}
        onRequestClose={() => setIsRatingVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.ratingModal]}>
            <View style={styles.modalHeader}>
              <Typography variant="lg" weight="semibold">
                Rate Your Trip
              </Typography>
            </View>

            <ScrollView style={styles.ratingForm}>
              {bookingData.driver && (
                <View style={styles.driverRatingSection}>
                  <View style={styles.driverRatingHeader}>
                    <View style={styles.driverAvatarLarge}>
                      <Typography
                        variant="lg"
                        weight="semibold"
                        color="primary.brand"
                      >
                        {bookingData.driver.firstName[0]}
                        {bookingData.driver.lastName[0]}
                      </Typography>
                    </View>
                    <Typography variant="md" weight="medium">
                      How was your trip with {bookingData.driver.firstName}?
                    </Typography>
                  </View>

                  <View style={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                      >
                        <Star
                          size={36}
                          color={theme.getColor("warning")}
                          fill={
                            star <= rating
                              ? theme.getColor("warning")
                              : "transparent"
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.tripSummary}>
                <Typography
                  variant="md"
                  weight="semibold"
                  style={styles.summaryTitle}
                >
                  Trip Summary
                </Typography>

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Typography variant="sm" color="gray.500">
                      Distance
                    </Typography>
                    <Typography variant="md" weight="semibold">
                      {tripData.distance.toFixed(1)} km
                    </Typography>
                  </View>

                  <View style={styles.summaryItem}>
                    <Typography variant="sm" color="gray.500">
                      Duration
                    </Typography>
                    <Typography variant="md" weight="semibold">
                      {getTimeBetween(tripData.startTime, tripData.endTime)}
                    </Typography>
                  </View>

                  <View style={styles.summaryItem}>
                    <Typography variant="sm" color="gray.500">
                      Cost
                    </Typography>
                    <Typography variant="md" weight="semibold">
                      {formatCurrency(tripData.cost)}
                    </Typography>
                  </View>
                </View>
              </View>

              <Typography
                variant="md"
                weight="medium"
                style={styles.experienceLabel}
              >
                How would you rate your overall experience?
              </Typography>

              <View style={styles.emojiRating}>
                {[0, 1, 2, 3, 4].map((index) =>
                  renderEmoji(index, experienceRating === index + 1, () =>
                    setExperienceRating(index + 1)
                  )
                )}
              </View>

              <Typography variant="md" weight="medium" style={styles.formLabel}>
                Additional comments (optional)
              </Typography>

              <TextInput
                style={[
                  styles.textArea,
                  { borderColor: theme.getColor("gray.300") },
                ]}
                placeholder="Tell us about your experience..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={ratingComment}
                onChangeText={setRatingComment}
              />

              <View style={styles.formActions}>
                <Button
                  title="Skip"
                  onPress={() => {
                    setIsRatingVisible(false);
                    router.navigate("/");
                  }}
                  variant="secondary"
                  style={styles.formButton}
                  disabled={isLoading}
                />
                <Button
                  title={isLoading ? "Submitting..." : "Submit Rating"}
                  onPress={submitRating}
                  style={styles.formButton}
                  disabled={isLoading}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safetyButtonsContainer: {
    right: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    zIndex: 4,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 5,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  tripProgress: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    width: "100%",
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center",
  },
  emergencyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emergencyButtonInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  safetyMenuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerContainer: {
    alignItems: "center",
  },
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statusCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    borderRadius: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
  },
  statusCardContent: {
    padding: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusIconAndText: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    marginLeft: 8,
  },
  driverAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3CB35A",
    marginBottom: 12,
  },
  driverInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  driverDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  driverRating: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ratingDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    marginRight: 8,
  },
  currentLocation: {
    marginTop: 16,
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  locationText: {
    marginLeft: 8,
    flex: 1,
  },
  completedActions: {
    marginTop: 16,
  },
  rateButton: {
    width: "100%",
    marginBottom: 16,
  },
  tripStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  ratingModal: {
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  menuScroll: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuCloseButton: {
    marginTop: 8,
  },
  reportForm: {
    marginBottom: 20,
  },
  formLabel: {
    marginBottom: 12,
    marginTop: 16,
  },
  reasonOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 8,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: "top",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  formButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  ratingForm: {
    marginBottom: 20,
  },
  driverRatingSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  driverRatingHeader: {
    alignItems: "center",
  },
  starRating: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "center",
    gap: 8,
  },
  tripSummary: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  experienceLabel: {
    marginBottom: 16,
    textAlign: "center",
  },
  emojiRating: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  emojiButton: {
    width: 64,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 8,
  },
});
