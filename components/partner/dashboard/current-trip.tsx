import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { MapPin, Clock, User, Car } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const CurrentTrip: React.FC = () => {
  const currentUser = useQuery(api.auth.getMe);
  // Get theme values once
  const { colors } = useTheme();

  const trip = useQuery(api.trips.getCurrentTrip, {
    partnerId: currentUser?._id!,
  });

  const client = useQuery(
    api.users.getUser,
    trip?.clientId
      ? {
          userId: trip?.clientId!,
        }
      : "skip"
  );

  const labelForStatus = {
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    accepted: "Accepted",
    rejected: "Rejected",
  };

  // Create a memoized empty state component to avoid re-rendering
  const emptyStateComponent = useMemo(() => {
    if (trip) return null;

    return (
      <View style={styles.emptyState}>
        <Car size={40} color={colors?.gray[400]} />
        <Typography
          variant="md"
          weight="medium"
          style={{ color: colors?.gray[500], marginTop: 12 }}
        >
          No active trip
        </Typography>
        <Typography
          variant="sm"
          style={{
            color: colors?.gray[400],
            textAlign: "center",
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          You don't have any active trip at the moment
        </Typography>
      </View>
    );
  }, [trip, colors]);

  // Return early if no trip to avoid unnecessary renders
  if (!trip) {
    return <Card style={styles.currentTripCard}>{emptyStateComponent}</Card>;
  }

  // This will only render if there's a trip
  return (
    <Card style={styles.currentTripCard}>
      <View style={styles.currentTripHeader}>
        <View style={styles.statusBadge}>
          <Clock size={14} color={colors?.primary.brand} />
          <Typography
            variant="sm"
            weight="medium"
            style={{ color: colors?.primary.brand, marginLeft: 4 }}
          >
            {labelForStatus[trip.status as keyof typeof labelForStatus]}
          </Typography>
        </View>
        <Typography variant="lg" weight="bold" style={{ marginTop: 8 }}>
          {trip.pricing?.total} MAD
        </Typography>
      </View>

      <View style={styles.tripRoute}>
        <View style={styles.routePoint}>
          <MapPin size={20} color={colors?.success} />
          <View style={styles.routeInfo}>
            <Typography variant="sm" style={{ color: colors?.gray[500] }}>
              Pickup
            </Typography>
            <Typography variant="md" weight="medium">
              {trip.pickupLocation.address}
            </Typography>
          </View>
          <Typography
            variant="sm"
            weight="medium"
            style={{ color: colors?.success }}
          >
            {new Date(trip.timing.departureDate!).toLocaleTimeString()}
          </Typography>
        </View>

        <View style={styles.routeDivider} />

        <View style={styles.routePoint}>
          <MapPin size={20} color={colors?.error} />
          <View style={styles.routeInfo}>
            <Typography variant="sm" style={{ color: colors?.gray[500] }}>
              Drop-off
            </Typography>
            <Typography variant="md" weight="medium">
              {trip.dropoffLocation.address}
            </Typography>
          </View>
          <Typography variant="sm" weight="medium">
            {new Date(trip.timing.arrivalDate!).toLocaleTimeString()}
          </Typography>
        </View>

        <View style={styles.customerInfo}>
          <User size={16} color={colors?.gray[500]} />
          <Typography
            variant="sm"
            style={{ color: colors?.gray[500], marginLeft: 4 }}
          >
            {client?.firstName} • {client?.rating} ★
          </Typography>
        </View>
      </View>
    </Card>
  );
};

// Styles defined outside component to prevent recreation on each render
const styles = StyleSheet.create({
  currentTripHeader: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  currentTripCard: {
    marginBottom: 8,
  },
  tripRoute: {
    gap: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeDivider: {
    width: 2,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginLeft: 10,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});
