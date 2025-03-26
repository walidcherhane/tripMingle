// components/dashboard/vehicle/vehicle-metrics.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { TrendingUp, Car, Star, Ban } from "lucide-react-native";

interface VehicleMetricsProps {
  metrics: {
    completedTrips: number;
    totalEarnings: number;
    averageRating: number;
    cancellationRate: number;
  };
}

export const VehicleMetrics = ({ metrics }: VehicleMetricsProps) => {
  const theme = useTheme();

  const metricsData = [
    {
      icon: Car,
      value: metrics.completedTrips,
      label: "Trips",
      color: theme.colors.primary.brand,
    },
    {
      icon: TrendingUp,
      value: `${metrics.totalEarnings.toLocaleString()} MAD`,
      label: "Earnings",
      color: theme.colors.success,
    },
    {
      icon: Star,
      value: metrics.averageRating.toFixed(1),
      label: "Rating",
      color: theme.colors.warning,
    },
    {
      icon: Ban,
      value: `${metrics.cancellationRate}%`,
      label: "Cancellation",
      color:
        metrics.cancellationRate > 5
          ? theme.colors.error
          : theme.colors.gray[500],
    },
  ];

  return (
    <View style={styles.container}>
      {metricsData.map((metric, index) => (
        <Card key={index} style={styles.metricCard}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${metric.color}10` },
            ]}
          >
            <metric.icon size={20} color={metric.color} />
          </View>
          <Typography
            variant="xl"
            weight="bold"
            style={StyleSheet.flatten([
              styles.value,
              { color: theme.colors.text },
            ])}
          >
            {metric.value}
          </Typography>
          <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
            {metric.label}
          </Typography>
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  value: {
    marginBottom: 4,
  },
});
