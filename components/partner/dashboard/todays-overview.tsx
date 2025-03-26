// components/dashboard/TodaysOverview.tsx
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Car,
} from "lucide-react-native";
import { theme } from "@/theme";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";

interface Stat {
  current: number;
  previous: number;
  trend: number;
}

interface OverviewProps {
  earnings: Stat;
  trips: Stat;
  rating: Stat;
}

export const TodaysOverview = () => {
  const currentUser = useQuery(api.auth.getMe);

  // Get today's start and end timestamps only once
  const todayStart = useMemo(() => new Date().getTime(), []);
  const todayEnd = useMemo(
    () => new Date(todayStart + 24 * 60 * 60 * 1000).getTime(),
    [todayStart]
  );

  const userReviewStats = useQuery(api.reviews.getUserReviewStats, {
    userId: currentUser?._id as Id<"users">,
  });

  // Fetch today's completed trips (for today's stats)
  const todayCompletedTrips = useQuery(
    api.trips.getPartnerTripsByDate,
    currentUser?._id
      ? {
          partnerId: currentUser?._id as Id<"users">,
          status: "completed",
          startDate: todayStart,
          endDate: todayEnd,
        }
      : "skip"
  );

  // Fetch all completed trips (for total earnings)
  const allCompletedTrips = useQuery(
    api.trips.getPartnerTrips,
    currentUser?._id
      ? {
          partnerId: currentUser?._id as Id<"users">,
          status: "completed",
          limit: 100, // Increase limit to get more historical trips
        }
      : "skip"
  );

  // Calculate today's stats - only when todayCompletedTrips changes
  const todayStats = useMemo(() => {
    if (!todayCompletedTrips) return null;

    const totalEarnings = todayCompletedTrips.reduce(
      (sum: number, trip: Doc<"trips">) => sum + (trip.pricing?.total || 0),
      0
    );

    return {
      earnings: totalEarnings,
      completedTrips: todayCompletedTrips.length,
      rating: userReviewStats?.averageRating || 0,
    };
  }, [todayCompletedTrips, userReviewStats]);

  // Calculate total earnings from all completed trips
  const totalEarningsStats = useMemo(() => {
    if (!allCompletedTrips) return 0;

    return allCompletedTrips.reduce(
      (sum: number, trip: Doc<"trips">) => sum + (trip.pricing?.total || 0),
      0
    );
  }, [allCompletedTrips]);

  // Calculate overview data with comparison to previous period
  const overviewData = useMemo(() => {
    if (!todayStats) return null;

    // In a real app, you'd query yesterday's data for comparison
    const previousEarnings = todayStats.earnings * 0.85; // Estimated for demo
    const previousTrips = Math.max(
      1,
      Math.floor(todayStats.completedTrips * 0.9)
    ); // Estimated for demo

    return {
      earnings: {
        current: todayStats.earnings,
        previous: previousEarnings,
        trend:
          todayStats.earnings > 0
            ? Math.round(
                ((todayStats.earnings - previousEarnings) / previousEarnings) *
                  100
              )
            : 0,
      },
      trips: {
        current: todayStats.completedTrips,
        previous: previousTrips,
        trend:
          todayStats.completedTrips > 0
            ? Math.round(
                ((todayStats.completedTrips - previousTrips) / previousTrips) *
                  100
              )
            : 0,
      },
      rating: {
        current: todayStats.rating,
        previous: todayStats.rating - 0.1,
        trend: 2,
      },
    };
  }, [todayStats]);

  const getTrendColor = (trend: number) => {
    return trend >= 0 ? theme.colors.success : theme.colors.error;
  };

  const getTrendIcon = (trend: number) => {
    return trend >= 0 ? TrendingUp : TrendingDown;
  };

  const getPercentage = (rating: 1 | 2 | 3 | 4 | 5) => {
    return (
      ((userReviewStats?.ratingDistribution[rating] || 0) /
        (userReviewStats?.totalReviews || 1)) *
      100
    );
  };

  if (!overviewData) return null;
  return (
    <Card>
      <View style={styles.header}>
        <Typography variant="lg" weight="semibold">
          Today's Overview
        </Typography>
      </View>

      <View style={styles.statsGrid}>
        {/* Earnings Stat */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Typography variant="md" style={{ color: theme.colors.gray[500] }}>
              Earnings
            </Typography>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
            }}
          >
            <Typography variant="2xl" weight="bold" style={styles.statValue}>
              {overviewData?.earnings.current} MAD
            </Typography>
            {overviewData?.earnings.trend !== 0 && (
              <View
                style={[
                  styles.trendBadge,
                  {
                    backgroundColor: `${getTrendColor(overviewData?.earnings.trend)}10`,
                  },
                ]}
              >
                {React.createElement(
                  getTrendIcon(overviewData?.earnings.trend),
                  {
                    size: 12,
                    color: getTrendColor(overviewData?.earnings.trend),
                  }
                )}
                <Typography
                  variant="md"
                  weight="medium"
                  style={{
                    color: getTrendColor(overviewData?.earnings.trend),
                    marginLeft: 2,
                  }}
                >
                  {Math.abs(overviewData?.earnings.trend)}%
                </Typography>
              </View>
            )}
          </View>
          <Typography variant="xs" style={{ color: theme.colors.gray[500] }}>
            vs {overviewData?.earnings.previous} MAD yesterday
          </Typography>
        </View>

        {/* Trips Stat */}
        <View style={[styles.statCard, styles.middleStat]}>
          <View style={styles.statHeader}>
            <Typography variant="md" style={{ color: theme.colors.gray[500] }}>
              Trips
            </Typography>
            <Car size={20} color={theme.colors.primary.brand} />
          </View>
          <View style={styles.tripStats}>
            <View>
              <Typography variant="2xl" weight="bold">
                {overviewData?.trips.current}
              </Typography>
              <Typography
                variant="xs"
                style={{ color: theme.colors.gray[500] }}
              >
                Completed
              </Typography>
            </View>
            <View style={styles.tripProgress}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.primary.lightest },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.primary.brand,
                      width: `${(overviewData?.trips.current / 10) * 100}%`, // Assuming 10 is target
                    },
                  ]}
                />
              </View>
              <Typography
                variant="xs"
                style={{ color: theme.colors.gray[500] }}
              >
                Daily Goal: 10
              </Typography>
            </View>
          </View>
        </View>

        {/* Rating Stat */}
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              Rating
            </Typography>
            <Star size={20} color={theme.colors.warning} />
          </View>
          <Typography variant="2xl" weight="bold" style={styles.statValue}>
            {overviewData?.rating.current.toFixed(1)}
          </Typography>
          <View style={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((star) => (
              <View key={star} style={styles.ratingBar}>
                <Typography
                  variant="xs"
                  style={{ color: theme.colors.gray[500], width: 15 }}
                >
                  {star}
                </Typography>
                <View
                  style={[
                    styles.ratingBarBg,
                    { backgroundColor: theme.colors.gray[200] },
                  ]}
                >
                  <View
                    style={[
                      styles.ratingBarFill,
                      {
                        backgroundColor: theme.colors.warning,
                        width: `${getPercentage(star as 1 | 2 | 3 | 4 | 5)}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    flex: 1,
  },
  middleStat: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 16,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statValue: {
    marginBottom: 4,
  },
  tripStats: {
    gap: 8,
  },
  tripProgress: {
    gap: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  ratingBars: {
    gap: 4,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingBarBg: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
  },
});
