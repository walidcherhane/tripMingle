import { View, Text } from "react-native";
import React from "react";
import { StyleSheet } from "react-native";
import { theme } from "@/theme";
import { Typography } from "./typography";
import { spacing } from "@/theme/spacing";

type Props = {
  title: string;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "danger" | "warning";
};

const Badge = ({
  title,
  color = "secondary",
  leftIcon,
  rightIcon,
  size = "medium",
}: Props) => {
  const padding = {
    small: theme.spacing.xs,
    medium: theme.spacing.sm,
    large: theme.spacing.md,
  };
  return (
    <View
      style={[
        styles.badgeContainer,
        {
          padding: padding[size],
          paddingHorizontal: padding[size] * 1.9,
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {leftIcon}
        <Typography style={{ ...styles[size], ...styles[color] }}>
          {title}
        </Typography>
        {rightIcon}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: "white",
    borderRadius: theme.borderRadius.full,
    borderColor: "gray",
    borderWidth: 1,
  },
  small: {
    fontSize: theme.typography.sizes.sm,
  },
  medium: {
    fontSize: theme.typography.sizes.md,
  },
  large: {
    fontSize: theme.typography.sizes.lg,
  },
  primary: {
    color: "blue",
  },
  secondary: {
    color: "gray",
  },
  success: {
    color: "green",
  },
  danger: {
    color: "red",
  },
  warning: {
    color: "yellow",
  },
  title: {},
});

export default Badge;
