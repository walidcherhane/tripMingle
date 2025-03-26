// components/trips/TripsList.tsx
import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import type { Trip } from "@/types/trip";
import { TabType } from "./trips-tabs";
import { TripsEmptyState } from "./trips-empty-state";
import { TripCard } from "./trip-card";
import { useTheme } from "@/hooks/useTheme";

interface TripsListProps {
  trips: any[]; // Using any to accommodate both app Trip type and Convex trip data
  type: TabType;
  refreshing: boolean;
  onRefresh: () => void;
  onTripPress: (tripId: string) => void;
  isLoading?: boolean;
}

export const TripsList = ({
  trips,
  type,
  refreshing,
  onRefresh,
  onTripPress,
  isLoading = false,
}: TripsListProps) => {
  const theme = useTheme();

  // Memoize the list items to prevent unnecessary re-renders
  const tripItems = useMemo(() => {
    return trips.map((trip) => (
      <TripCard key={trip.id || trip._id} trip={trip} onPress={onTripPress} />
    ));
  }, [trips, onTripPress]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.brand} />
      </View>
    );
  }

  if (trips.length === 0) {
    return <TripsEmptyState type={type} />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {tripItems}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
});
