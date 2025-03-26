// app/(main)/partner/(tabs)/index.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, Settings } from "lucide-react-native";
import { theme } from "@/theme";
import { CurrentTrip } from "@/components/partner/dashboard/current-trip";
import UpcomingTrips from "@/components/partner/dashboard/upcoming-trip";
import { TodaysOverview } from "@/components/partner/dashboard/todays-overview";
import { TripRequest } from "@/components/partner/dashboard/trip-request";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { colors } from "@/theme/colors";

export default function PartnerDashboard() {
  // State

  // Fetch current user - this should be stable
  const currentUser = useQuery(api.auth.getMe);
  // fetch partner trip requests
  const tripRequests = useQuery(api.trips.getTripRequests, {
    partnerId: currentUser?._id!,
  });

  const totalEarningsStats = useQuery(api.trips.getTotalEarnings, {
    partnerId: currentUser?._id!,
  });

  // Header right component to avoid re-renders
  const headerRight = () => (
    <Button
      size="sm"
      variant="secondary"
      leftIcon={<AlertTriangle size={18} />}
      onPress={() => router.push("/partner/notifications")}
      title="Alerts"
    />
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <Stack.Screen
        options={{
          title: "Dashboard",
          headerRight,
        }}
      />

      <ScrollView style={styles.container}>
        {/* Welcome Section */}
        <View style={styles.headerContainer}>
          <View style={styles.welcomeHeader}>
            <Typography
              variant="sm"
              style={{ color: colors.text || theme.colors.text }}
            >
              Welcome back
            </Typography>
            <Typography variant="xl" weight="bold">
              {currentUser?.firstName || "Partner"} 👋
            </Typography>
          </View>
          <View style={styles.actionButtonsContainer}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push("/partner/notifications")}
            >
              <Bell size={theme.icons.sizes.sm} color={colors.primary.brand} />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push("/partner/settings")}
            >
              <Settings
                size={theme.icons.sizes.sm}
                color={colors.primary.brand}
              />
            </Pressable>
          </View>
        </View>

        {/* Total Earnings Section */}
        {totalEarningsStats && (
          <View style={styles.totalEarningsContainer}>
            <Typography variant="md" style={{ color: theme.colors.gray[600] }}>
              Total Earnings
            </Typography>
            <Typography
              variant="xl"
              weight="bold"
              style={{ color: theme.colors.success }}
            >
              {totalEarningsStats.toLocaleString()} MAD
            </Typography>
          </View>
        )}

        {/* New Trip Requests - Only show when partner is online and has a vehicle */}
        {tripRequests?.map((trip) => (
          <TripRequest key={trip._id} trip={trip} />
        ))}

        {/* Current Trip */}
        <CurrentTrip />

        {/* Upcoming Trips */}
        <UpcomingTrips />

        {/* Today's Overview */}
        <TodaysOverview />
      </ScrollView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: theme.spacing.md,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeHeader: {
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.md,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: `#ffff`,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  totalEarningsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f0fff4",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.success,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
