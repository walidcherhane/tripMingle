// components/dashboard/vehicle/vehicle-analytics.tsx
import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import {
  TrendingUp,
  Calendar,
  ChevronRight,
  MapPin,
  Users,
  Clock,
} from "lucide-react-native";
import { CartesianChart, Line } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import Raleway from "@/assets/fonts/Raleway-VariableFont_wght.ttf";
import { colors } from "@/theme/colors";

interface AnalyticsData {
  earnings: {
    daily: { date: string; amount: number }[];
    total: number;
    trend: number;
  };
  trips: {
    total: number;
    completed: number;
    cancelled: number;
    popularRoutes: Array<{
      from: string;
      to: string;
      count: number;
    }>;
    timeDistribution: Array<{
      hour: string;
      trips: number;
    }>;
  };
  customers: {
    total: number;
    returning: number;
    newThisMonth: number;
    satisfaction: number;
  };
}

interface VehicleAnalyticsProps {
  data: AnalyticsData;
  onPeriodChange: (period: "day" | "week" | "month") => void;
  selectedPeriod: "day" | "week" | "month";
}

export const VehicleAnalytics = ({
  data,
  onPeriodChange,
  selectedPeriod,
}: VehicleAnalyticsProps) => {
  const font = useFont(Raleway, 12);
  const theme = useTheme();
  const { width } = Dimensions.get("window");
  const chartWidth = width - 48; // Accounting for padding

  const periods = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ] as const;

  // const earningsData = useMemo(() => {

  //   return data.earnings.
  // }, [data])

  const earningsData = useMemo(() => {
    return data.earnings.daily.map((entry) => ({
      day: entry.date,
      amount: entry.amount,
    }));
  }, [data.earnings]);

  const tripsData = useMemo(() => {
    return data.trips.timeDistribution.map((entry) => ({
      hour: entry.hour,
      trips: entry.trips,
    }));
  }, [data.trips]);

  return (
    <View style={styles.container}>
      {/* Period Selection */}
      <View style={styles.periodSelection}>
        {periods.map((period) => (
          <Button
            key={period.value}
            title={period.label}
            size="sm"
            variant={selectedPeriod === period.value ? "primary" : "secondary"}
            onPress={() => onPeriodChange(period.value)}
          />
        ))}
      </View>

      {/* Earnings Chart */}
      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Typography
              variant="lg"
              weight="semibold"
              style={{ color: theme.colors.text }}
            >
              Earnings Overview
            </Typography>
            <Typography
              variant="sm"
              style={{ color: theme.colors.gray[500], marginTop: 4 }}
            >
              {selectedPeriod === "day"
                ? "Today"
                : selectedPeriod === "week"
                ? "This Week"
                : "This Month"}
            </Typography>
          </View>
          <View style={styles.trendContainer}>
            <TrendingUp
              size={16}
              color={
                data.earnings.trend >= 0
                  ? theme.colors.success
                  : theme.colors.error
              }
            />
            <Typography
              variant="sm"
              weight="medium"
              style={{
                color:
                  data.earnings.trend >= 0
                    ? theme.colors.success
                    : theme.colors.error,
                marginLeft: 4,
              }}
            >
              {data.earnings.trend}%
            </Typography>
          </View>
        </View>

        <View style={styles.chart}>
          <CartesianChart
            data={earningsData} // 👈 specify your data
            xKey="amount" // 👈 specify data key for x-axis
            yKeys={["amount", "amount"]} // 👈 specify data keys used for y-axis
            axisOptions={{ font }}
          >
            {/* 👇 render function exposes various data, such as points. */}
            {({ points }) => (
              // 👇 and we'll use the Line component to render a line path.
              <Line
                points={points.amount}
                color={colors.primary.brand}
                strokeWidth={3}
              />
            )}
          </CartesianChart>
        </View>
      </Card>

      {/* Trip Statistics */}
      <Card>
        <Typography
          variant="lg"
          weight="semibold"
          style={{ color: theme.colors.text }}
        >
          Trip Statistics
        </Typography>

        <View style={styles.tripStats}>
          <View style={styles.tripStat}>
            <Typography
              variant="xl"
              weight="bold"
              style={{ color: theme.colors.text }}
            >
              {data.trips.completed}
            </Typography>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              Completed
            </Typography>
          </View>
          <View style={styles.tripStat}>
            <Typography
              variant="xl"
              weight="bold"
              style={{ color: theme.colors.text }}
            >
              {data.trips.cancelled}
            </Typography>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              Cancelled
            </Typography>
          </View>
          <View style={styles.tripStat}>
            <Typography
              variant="xl"
              weight="bold"
              style={{ color: theme.colors.text }}
            >
              {((data.trips.completed / data.trips.total) * 100).toFixed(1)}%
            </Typography>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              Completion Rate
            </Typography>
          </View>
        </View>

        {/* Popular Routes */}
        <View style={styles.section}>
          <Typography
            variant="md"
            weight="semibold"
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: theme.colors.text },
            ])}
          >
            Popular Routes
          </Typography>
          {data.trips.popularRoutes.map((route, index) => (
            <View key={index} style={styles.routeItem}>
              <MapPin size={16} color={theme.colors.gray[400]} />
              <View style={styles.routeInfo}>
                <Typography variant="sm" style={{ color: theme.colors.text }}>
                  {route.from} → {route.to}
                </Typography>
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.gray[500] }}
                >
                  {route.count} trips
                </Typography>
              </View>
            </View>
          ))}
        </View>

        {/* Time Distribution */}
        <View style={styles.section}>
          <Typography
            variant="md"
            weight="semibold"
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: theme.colors.text },
            ])}
          >
            Peak Hours
          </Typography>
          <View style={styles.chart}>
            <CartesianChart
              data={tripsData}
              xKey="hour"
              yKeys={["trips", "trips"]}
              axisOptions={{ font }}
            >
              {({ points }) => (
                <Line
                  points={points.trips}
                  color={colors.primary.brand}
                  strokeWidth={3}
                />
              )}
            </CartesianChart>
          </View>
        </View>
      </Card>

      {/* Customer Insights */}
      <Card>
        <Typography
          variant="lg"
          weight="semibold"
          style={{ color: theme.colors.text }}
        >
          Customer Insights
        </Typography>

        <View style={styles.customerStats}>
          <View style={styles.customerStat}>
            <Users size={20} color={theme.colors.primary.brand} />
            <Typography
              variant="2xl"
              weight="bold"
              style={{ color: theme.colors.text }}
            >
              {data.customers.total}
            </Typography>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              Total Customers
            </Typography>
          </View>

          <View style={styles.customerStat}>
            <Clock size={20} color={theme.colors.success} />
            <Typography
              variant="2xl"
              weight="bold"
              style={{ color: theme.colors.text }}
            >
              {data.customers.returning}
            </Typography>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              Returning
            </Typography>
          </View>
        </View>

        <View style={styles.satisfactionContainer}>
          <Typography
            variant="md"
            weight="semibold"
            style={{ color: theme.colors.text }}
          >
            Customer Satisfaction
          </Typography>
          <Typography
            variant="2xl"
            weight="bold"
            style={{ color: theme.colors.success }}
          >
            {data.customers.satisfaction}%
          </Typography>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  periodSelection: {
    flexDirection: "row",
    gap: 8,
  },
  chartCard: {
    padding: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  chart: {
    marginTop: 16,
    height: 200,
  },
  tripStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  tripStat: {
    alignItems: "center",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  routeInfo: {
    marginLeft: 8,
    flex: 1,
  },
  timeDistribution: {
    marginTop: 8,
  },
  customerStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  customerStat: {
    alignItems: "center",
  },
  satisfactionContainer: {
    marginTop: 24,
    alignItems: "center",
  },
});
