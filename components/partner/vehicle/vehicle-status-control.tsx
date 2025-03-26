// components/dashboard/vehicle/vehicle-status-control.tsx
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { CheckCircle, AlertTriangle, Car } from "lucide-react-native";

type VehicleStatus = "active" | "inactive" | "maintenance";

interface VehicleStatusControlProps {
  currentStatus: VehicleStatus;
  onStatusChange: (status: VehicleStatus) => void;
}

export const VehicleStatusControl = ({
  currentStatus,
  onStatusChange,
}: VehicleStatusControlProps) => {
  const theme = useTheme();

  const statuses: {
    value: VehicleStatus;
    label: string;
    icon: typeof CheckCircle;
    color: string;
    description: string;
  }[] = [
    {
      value: "active",
      label: "Active",
      icon: CheckCircle,
      color: theme.colors.success,
      description: "Vehicle is available for bookings",
    },
    {
      value: "maintenance",
      label: "Maintenance",
      icon: AlertTriangle,
      color: theme.colors.warning,
      description: "Temporarily unavailable for maintenance",
    },
    {
      value: "inactive",
      label: "Inactive",
      icon: Car,
      color: theme.colors.gray[500],
      description: "Vehicle is not accepting bookings",
    },
  ];

  return (
    <Card>
      <Typography
        variant="lg"
        weight="semibold"
        style={StyleSheet.flatten([styles.title, { color: theme.colors.text }])}
      >
        Vehicle Status
      </Typography>

      <View style={styles.statusContainer}>
        {statuses.map((status) => {
          const isSelected = currentStatus === status.value;
          const StatusIcon = status.icon;

          return (
            <Pressable
              key={status.value}
              style={({ pressed }) => [
                styles.statusOption,
                {
                  backgroundColor: isSelected
                    ? `${status.color}10`
                    : theme.colors.gray[50],
                  borderColor: isSelected
                    ? status.color
                    : theme.colors.gray[200],
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => onStatusChange(status.value)}
            >
              <StatusIcon
                size={20}
                color={isSelected ? status.color : theme.colors.gray[400]}
              />
              <View style={styles.statusText}>
                <Typography
                  variant="md"
                  weight={isSelected ? "semibold" : "medium"}
                  style={{
                    color: isSelected ? status.color : theme.colors.text,
                  }}
                >
                  {status.label}
                </Typography>
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.gray[500] }}
                >
                  {status.description}
                </Typography>
              </View>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
  },
  statusContainer: {
    gap: 12,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  statusText: {
    flex: 1,
  },
});
