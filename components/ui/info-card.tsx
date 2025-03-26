// components/ui/info-card.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "./typography";
import { theme } from "@/theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary.brand + "10",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  content: {
    marginTop: theme.spacing.md,
  },
});

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => (
  <View style={styles.container}>
    <Typography
      variant="h3"
      weight="semibold"
      color={theme.colors.primary.brand}
    >
      {title}
    </Typography>
    <View style={styles.content}>{children}</View>
  </View>
);
