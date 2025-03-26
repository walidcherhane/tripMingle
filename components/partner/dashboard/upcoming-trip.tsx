import { View, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { router } from "expo-router";
import { Pressable } from "react-native-gesture-handler";
import { theme } from "@/theme";
import {
  Clock,
  Calendar,
  Users,
  Car,
  MapPin,
  Phone,
} from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { colors } from "@/theme/colors";
import { formatDate, formatTime } from "@/utils/date"; // Use the existing date utils file

const UpcomingTrips = () => {
  const currentUser = useQuery(api.auth.getMe);
  const upcomingTrips = useQuery(api.trips.getUpcomingTrips, {
    partnerId: currentUser?._id!,
  });

  // Helper function to convert timestamp to Date object
  const getDate = (timestamp: number | Date | undefined): Date => {
    if (!timestamp) return new Date();
    return typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  };

  return (
    <Card style={styles.upcomingTripsCard}>
      <View style={styles.sectionHeader}>
        <Typography variant="lg" weight="semibold">
          Next Trips
        </Typography>
        <Button
          size="sm"
          variant="secondary"
          title="View All"
          onPress={() => router.push("/(main)/partner/(tabs)/trips")}
        />
      </View>

      {upcomingTrips?.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={40} color={colors.gray[400]} />
          <Typography
            variant="md"
            weight="medium"
            style={{
              color: colors.gray[500],
              marginTop: 12,
            }}
          >
            No upcoming trips
          </Typography>
          <Typography
            variant="sm"
            style={{
              color: colors.gray[400],
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Your next trips will appear here when clients book with you
          </Typography>
        </View>
      ) : (
        upcomingTrips?.map((trip, index) => (
          <Pressable
            key={trip._id}
            style={[
              styles.upcomingTrip,
              index < upcomingTrips.length - 1 && styles.tripDivider,
            ]}
            onPress={() =>
              router.push(`/(main)/partner/(tabs)/trips/${trip._id}`)
            }
          >
            <View style={styles.tripHeader}>
              <View style={styles.tripDateTime}>
                <View style={styles.dateContainer}>
                  <Calendar size={16} color={colors.primary.brand} />
                  <Typography variant="sm" weight="medium">
                    {formatDate(getDate(trip.timing.departureDate))}
                  </Typography>
                </View>
                <View style={styles.timeContainer}>
                  <Clock size={16} color={colors.primary.brand} />
                  <Typography variant="sm" weight="medium">
                    {formatTime(getDate(trip.timing.departureDate), "12h")}
                  </Typography>
                </View>
              </View>
              <View style={styles.tripStatusContainer}>
                <Typography
                  variant="sm"
                  weight="semibold"
                  style={{
                    color: colors.primary.brand,
                    backgroundColor: colors.gray[100],
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  Accepted
                </Typography>
              </View>
            </View>

            <View style={styles.tripDetails}>
              <View style={styles.tripLocations}>
                <View style={styles.locationRow}>
                  <MapPin size={16} color={colors.success} />{" "}
                  {/* Use success color for pickup */}
                  <Typography
                    variant="md"
                    weight="medium"
                    style={styles.locationText}
                    color="success"
                  >
                    {trip.pickupLocation.address}
                  </Typography>
                </View>
                <View style={styles.locationRow}>
                  <MapPin size={16} color={colors.error} />{" "}
                  {/* Use error color for dropoff */}
                  <Typography
                    variant="md"
                    weight="medium"
                    style={styles.locationText}
                    color="error"
                  >
                    {trip.dropoffLocation.address}
                  </Typography>
                </View>
              </View>

              <View style={styles.tripInfoGroup}>
                <View style={styles.tripInfoRow}>
                  <Users size={16} color={colors.gray[500]} />
                  <Typography variant="sm" style={styles.infoText}>
                    {trip.tripDetails?.passengers || 1} Passenger
                    {trip.tripDetails?.passengers !== 1 ? "s" : ""}
                  </Typography>
                </View>

                <View style={styles.tripInfoRow}>
                  <Car size={16} color={colors.gray[500]} />
                  <Typography variant="sm" style={styles.infoText}>
                    {trip.vehicle?.brand} {trip.vehicle?.model}
                  </Typography>
                </View>

                {trip.client?.phone && (
                  <View style={styles.tripInfoRow}>
                    <Phone size={16} color={colors.gray[500]} />
                    <Typography variant="sm" style={styles.infoText}>
                      {trip.client.phone}
                    </Typography>
                  </View>
                )}

                <View style={styles.priceClientContainer}>
                  <Typography
                    variant="md"
                    weight="semibold"
                    style={{
                      color: colors.primary.brand,
                    }}
                  >
                    {trip.pricing?.total} MAD
                  </Typography>
                  <Typography variant="sm" style={{ color: colors.gray[500] }}>
                    {trip.client?.firstName} {trip.client?.lastName}
                  </Typography>
                </View>
              </View>
            </View>
          </Pressable>
        ))
      )}
    </Card>
  );
};

// Styles defined outside component to prevent recreation on each render
const styles = StyleSheet.create({
  upcomingTripsCard: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  upcomingTrip: {
    flexDirection: "column",
    gap: 12,
    paddingVertical: 16,
  },
  tripDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripDateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tripStatusContainer: {
    alignItems: "flex-end",
  },
  tripDetails: {
    flexDirection: "column",
    gap: 12,
  },
  tripLocations: {
    gap: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    flex: 1,
    flexWrap: "wrap",
  },
  tripInfoGroup: {
    gap: 8,
  },
  tripInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    color: colors.gray[700],
  },
  priceClientContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
});

export default UpcomingTrips;
