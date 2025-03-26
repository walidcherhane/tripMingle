// app/(main)/partner/(tabs)/trips/index.tsx
import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Stack, router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react-native";
import type { Trip } from "@/types/trip";
import { TabType, TripTabs } from "@/components/partner/trips/trips-tabs";
import {
  FilterPeriodKeys,
  TripFilters,
} from "@/components/partner/trips/trips-filters";
import { TripsList } from "@/components/partner/trips/trips-list";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SafeAreaView } from "react-native";

export default function TripsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [selectedPeriod, setSelectedPeriod] =
    useState<FilterPeriodKeys>("today");
  const [refreshing, setRefreshing] = useState(false);

  // Get the current partner's ID
  const currentUser = useQuery(api.auth.getMe);
  const partnerId = currentUser?._id;

  // Fetch trips data from Convex
  const trips = useQuery(
    api.trips.getPartnerTrips,
    partnerId
      ? {
          partnerId,
          status: activeTab === "upcoming" ? "searching" : "completed",
        }
      : "skip"
  );

  // Calculate date range only when the period changes, not on every render
  const dateRange = useMemo(() => {
    const now = new Date();
    const endDate = now.getTime();
    let startDate: number;

    switch (selectedPeriod) {
      case "today":
        // Start of today
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).getTime();
        break;
      case "week":
        // Start of this week (Sunday)
        const dayOfWeek = now.getDay();
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - dayOfWeek
        ).getTime();
        break;
      case "month":
        // Start of this month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        break;
      case "all":
      default:
        // For "all", set a very old date
        startDate = 0; // Starting from 1970 effectively means "all"
        break;
    }

    return { startDate, endDate };
  }, [selectedPeriod]);

  // Get trips for the selected period only if we have a valid partnerId and it's not "all"
  const tripsByDate = useQuery(
    api.trips.getPartnerTripsByDate,
    partnerId && selectedPeriod !== "all"
      ? {
          partnerId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }
      : "skip"
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // The Convex useQuery hook will automatically refresh the data
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    } catch (error) {
      console.error("Error refreshing trips:", error);
      setRefreshing(false);
    }
  };

  const handleTripPress = (tripId: string) => {
    router.push(`/(main)/partner/(tabs)/trips/${tripId}`);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Reset period filter when changing tabs
    setSelectedPeriod("today");
  };

  const handlePeriodChange = (period: FilterPeriodKeys) => {
    setSelectedPeriod(period);
  };

  const handleFilterPress = () => {
    router.push("/(main)/partner/(tabs)/trips/filters");
  };

  // Filter trips based on tab (upcoming or completed)
  // For "all" period we use the regular trips query, otherwise use period-filtered trips
  const allTrips = selectedPeriod === "all" ? trips || [] : tripsByDate || [];

  // Loading state
  if (!trips && !tripsByDate) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "My Trips",
            headerShadowVisible: false,
          }}
        />
        <TripTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <TripFilters
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        />
        <TripsList
          trips={allTrips}
          type={activeTab}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onTripPress={handleTripPress}
          isLoading={true}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "My Trips",
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView style={styles.container}>
        {/* Tabs */}
        <TripTabs activeTab={activeTab} onTabChange={handleTabChange} />
        {/* Period Filters
        <TripFilters
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
        /> */}
        {/* Trips List */}
        <TripsList
          trips={trips || []}
          type={activeTab}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onTripPress={handleTripPress}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },
});
