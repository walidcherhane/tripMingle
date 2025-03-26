import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import type { Trip } from "@/types/trip";
import { Clock, MapPin, User, CalendarDays } from "lucide-react-native";
import { TripRoute } from "./trip-route";
import { TripStatusBadge } from "./trip-status-badge";
import { formatDate, formatTime } from "@/utils/date";

interface TripCardProps {
  trip: any; // Using any to accommodate both app Trip type and Convex trip data
  onPress: (tripId: string) => void;
}

export const TripCard = ({ trip, onPress }: TripCardProps) => {
  const theme = useTheme();

  // Memoize all the transformed data to prevent recalculations on each render
  const {
    tripId,
    pickupLocation,
    dropoffLocation,
    status,
    displayDate,
    formattedDate,
    formattedTime,
    customerName,
    customerRating,
    priceAmount,
    priceCurrency,
  } = useMemo(() => {
    // Map Convex data structure to app's expected format
    const tripId = trip.id || trip._id;

    const pickupLocation = trip.pickup || {
      name:
        trip.pickupLocation?.placeName ||
        trip.pickupLocation?.address ||
        "Unknown",
      address: trip.pickupLocation?.address || "Unknown",
      coordinates: {
        latitude: trip.pickupLocation?.latitude || 0,
        longitude: trip.pickupLocation?.longitude || 0,
      },
    };

    const dropoffLocation = trip.dropoff || {
      name:
        trip.dropoffLocation?.placeName ||
        trip.dropoffLocation?.address ||
        "Unknown",
      address: trip.dropoffLocation?.address || "Unknown",
      coordinates: {
        latitude: trip.dropoffLocation?.latitude || 0,
        longitude: trip.dropoffLocation?.longitude || 0,
      },
    };

    // Handle different status formats (Convex vs app Trip type)
    const statusMapping: any = {
      searching: "pending",
      driverMatched: "accepted",
      driverApproaching: "arriving",
      driverArrived: "arrived",
      inProgress: "in_progress",
      completed: "completed",
      cancelled: "cancelled",
    };

    const status = statusMapping[trip.status] || trip.status;

    // Determine the date to display
    const displayDate =
      trip.scheduledFor ||
      (trip.timing?.departureDate && trip.timing?.departureTime
        ? `${trip.timing.departureDate}T${trip.timing.departureTime}`
        : trip.createdAt);

    // Pre-format the date and time
    const formattedDate = formatDate(displayDate);
    const formattedTime = formatTime(displayDate);

    // Customer info
    const customerName = trip.customer?.name || "Client";
    const customerRating = trip.customer?.rating;

    // Price info
    const priceAmount = trip.pricing?.totalAmount || trip.pricing?.total || 0;
    const priceCurrency = trip.pricing?.currency || "MAD";

    return {
      tripId,
      pickupLocation,
      dropoffLocation,
      status,
      displayDate,
      formattedDate,
      formattedTime,
      customerName,
      customerRating,
      priceAmount,
      priceCurrency,
    };
  }, [trip]);

  return (
    <Card style={styles.container} onPress={() => onPress(tripId)}>
      {/* Date/Time Header */}
      <View style={styles.header}>
        <View style={styles.dateTime}>
          <CalendarDays size={16} color={theme.colors.gray[500]} />
          <Typography
            variant="sm"
            style={{ color: theme.colors.gray[500], marginLeft: 4 }}
          >
            {formattedDate}
          </Typography>
        </View>
        <TripStatusBadge status={status} />
      </View>

      {/* Route Information */}
      <TripRoute
        pickup={pickupLocation}
        dropoff={dropoffLocation}
        time={formattedTime}
      />

      {/* Customer & Price Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.customerInfo}>
          <User size={16} color={theme.colors.gray[500]} />
          <Typography
            variant="sm"
            style={{ color: theme.colors.gray[500], marginLeft: 4 }}
          >
            {customerName}
            {customerRating && ` • ${customerRating} ★`}
          </Typography>
        </View>
        <Typography variant="md" weight="semibold">
          {priceAmount} {priceCurrency}
        </Typography>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateTime: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
});
