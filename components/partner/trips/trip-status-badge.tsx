import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";

// Use the status values directly from the Convex schema
type ConvexTripStatus =
  | "searching"
  | "driverMatched"
  | "driverApproaching"
  | "driverArrived"
  | "inProgress"
  | "completed"
  | "cancelled"
  // Support legacy types for backward compatibility
  | "pending"
  | "accepted"
  | "arriving"
  | "arrived"
  | "in_progress";

interface TripStatusBadgeProps {
  status: ConvexTripStatus;
}

export const TripStatusBadge = ({ status }: TripStatusBadgeProps) => {
  const theme = useTheme();

  const getStatusColor = (status: ConvexTripStatus) => {
    switch (status) {
      case "searching":
      case "pending":
        return theme.colors.warning;
      case "driverMatched":
      case "accepted":
        return theme.colors.primary.brand;
      case "driverApproaching":
      case "arriving":
        return theme.colors.info;
      case "driverArrived":
      case "arrived":
        return theme.colors.info;
      case "inProgress":
      case "in_progress":
        return theme.colors.success;
      case "completed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.gray[500];
    }
  };

  const color = getStatusColor(status);

  // Format the status text for display
  const formatStatus = (status: ConvexTripStatus) => {
    switch (status) {
      case "driverMatched":
        return "Driver Matched";
      case "driverApproaching":
        return "Driver Approaching";
      case "driverArrived":
        return "Driver Arrived";
      case "inProgress":
      case "in_progress":
        return "In Progress";
      default:
        // Capitalize first letter
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: `${color}15` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Typography variant="sm" weight="medium" style={{ color }}>
        {formatStatus(status)}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
