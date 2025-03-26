import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Typography } from "./typography";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  children,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.primary.brand} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Typography color="error" variant="sm">
          {error.message}
        </Typography>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
