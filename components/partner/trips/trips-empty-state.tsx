// components/trips/TripsEmptyState.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Calendar } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { TabType } from "./trips-tabs";

interface TripsEmptyStateProps {
  type: TabType;
}

export const TripsEmptyState = ({ type }: TripsEmptyStateProps) => {
  const theme = useTheme();

  const getMessage = () => {
    if (type === "upcoming") {
      return {
        title: "No Upcoming Trips",
        description: "You don't have any scheduled trips at the moment.",
      };
    }

    if (type === "history") {
      return {
        title: "No Trip History",
        description: "Your trips will appear here.",
      };
    }

    return {
      title: "No Trips",
      description: "Your trips will appear here.",
    };
  };

  const message = getMessage();

  return (
    <View style={styles.container}>
      <Calendar size={48} color={theme.colors.gray[400]} />
      <Typography variant="lg" weight="semibold" style={styles.title}>
        {message.title}
      </Typography>
      <Typography variant="md" style={styles.description}>
        {message.description}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginTop: 48,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    color: "#1F2937",
  },
  description: {
    color: "#6B7280",
    textAlign: "center",
  },
});
