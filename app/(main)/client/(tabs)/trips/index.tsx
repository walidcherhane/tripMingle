import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, formatTime } from "@/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useTheme as usePaperTheme } from "react-native-paper";
import { Id } from "@/convex/_generated/dataModel";
import { useBooking } from "@/context/BookingContext";
import { formatDistanceToNow } from "date-fns";
import { Typography } from "@/components/ui/typography";

// Trip status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let backgroundColor = "#e0e0e0";
  let textColor = "#000000";

  switch (status) {
    case "pending":
      backgroundColor = "#FFF9C4";
      textColor = "#F57F17";
      break;
    case "confirmed":
      backgroundColor = "#C8E6C9";
      textColor = "#2E7D32";
      break;
    case "completed":
      backgroundColor = "#BBDEFB";
      textColor = "#1565C0";
      break;
    case "cancelled":
      backgroundColor = "#FFCDD2";
      textColor = "#C62828";
      break;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Typography style={[styles.statusText, { color: textColor }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Typography>
    </View>
  );
};

export default function TripsScreen() {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { resetBooking } = useBooking();
  const [refreshing, setRefreshing] = useState(false);

  // Get trips from Convex
  const trips = useQuery(
    api.trips.getClientTrips,
    user?._id ? { clientId: user._id, limit: 20 } : "skip"
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // The query will automatically refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleTripPress = (tripId: string) => {
    router.push(`/(main)/client/(tabs)/trips/${tripId}`);
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Typography color="gray.600">
          Please log in to view your trips
        </Typography>
      </View>
    );
  }

  if (trips === undefined) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary.brand} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={64} color="#ccc" />
          <Typography style={styles.emptyText}>
            You haven't taken any trips yet
          </Typography>
          <TouchableOpacity
            style={[
              styles.bookButton,
              { backgroundColor: theme.colors.primary.brand },
            ]}
            onPress={() => {
              // Reset the booking state when starting a new booking
              console.log("[DEBUG] Resetting booking state from trips screen");
              resetBooking();
              router.push("/(main)/client/booking");
            }}
          >
            <Typography style={styles.bookButtonText}>Book a Trip</Typography>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tripCard}
              onPress={() => handleTripPress(item._id)}
            >
              <View style={styles.tripHeader}>
                <Typography style={styles.tripDate}>
                  {item.timing.isScheduled && item.timing.departureDate
                    ? formatDate(new Date(item.timing.departureDate))
                    : formatDate(new Date(item.createdAt))}
                </Typography>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.locationContainer}>
                <View style={styles.locationRow}>
                  <View style={styles.locationDot} />
                  <Typography style={styles.locationText} numberOfLines={1}>
                    {item.pickupLocation.address}
                  </Typography>
                </View>
                <View style={styles.locationLine} />
                <View style={styles.locationRow}>
                  <View style={[styles.locationDot, styles.destinationDot]} />
                  <Typography style={styles.locationText} numberOfLines={1}>
                    {item.dropoffLocation.address}
                  </Typography>
                </View>
              </View>

              {item.pricing && (
                <View style={styles.priceContainer}>
                  <Typography style={styles.priceLabel}>Total:</Typography>
                  <Typography style={styles.priceValue}>
                    {item.pricing.total} {item.pricing.currency}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  destinationDot: {
    backgroundColor: "#F44336",
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: "#e0e0e0",
    marginLeft: 5,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  bookButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
