// components/dashboard/QuickActions.tsx
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { Power, CarFront, Clock } from "lucide-react-native";

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  variant?: "default" | "primary" | "success" | "warning";
}

const QuickAction = ({
  icon,
  title,
  description,
  onPress,
  variant = "default",
}: QuickActionProps) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.colors.primary.lightest,
          iconColor: theme.colors.primary.brand,
        };
      case "success":
        return {
          backgroundColor: "#DCFCE7",
          iconColor: theme.colors.success,
        };
      case "warning":
        return {
          backgroundColor: "#FEF3C7",
          iconColor: theme.colors.warning,
        };
      default:
        return {
          backgroundColor: theme.colors.gray[50],
          iconColor: theme.colors.gray[500],
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: variantStyles.backgroundColor },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {React.cloneElement(icon as React.ReactElement, {
          size: 20,
          color: variantStyles.iconColor,
        })}
      </View>
      <View style={styles.actionContent}>
        <Typography variant="md" weight="semibold">
          {title}
        </Typography>
        <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
          {description}
        </Typography>
      </View>
    </Pressable>
  );
};

interface QuickActionsProps {
  isOnline: boolean;
  onToggleAvailability: () => void;
  onStartShift: () => void;
  onEndShift: () => void;
  shiftStarted: boolean;
}

export const QuickActions = ({
  isOnline,
  onToggleAvailability,
  onStartShift,
  onEndShift,
  shiftStarted,
}: QuickActionsProps) => {
  const theme = useTheme();

  return (
    <Card>
      <View style={styles.header}>
        <Typography variant="lg" weight="semibold">
          Quick Actions
        </Typography>
      </View>

      <View style={styles.actionsGrid}>
        {/* Availability Toggle */}
        <QuickAction
          icon={<Power />}
          title={isOnline ? "Go Offline" : "Go Online"}
          description={
            isOnline ? "Currently accepting trips" : "Not accepting trips"
          }
          onPress={onToggleAvailability}
          variant={isOnline ? "success" : "default"}
        />

        {/* Shift Control */}
        <QuickAction
          icon={<Clock />}
          title={shiftStarted ? "End Shift" : "Start Shift"}
          description={
            shiftStarted ? "Active for 6h 23m" : "Start your workday"
          }
          onPress={shiftStarted ? onEndShift : onStartShift}
          variant={shiftStarted ? "primary" : "default"}
        />

        {/* Vehicle Status */}
        <QuickAction
          icon={<CarFront />}
          title="Vehicle Status"
          description="Update availability"
          onPress={() => {}}
          variant="default"
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContent: {
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
