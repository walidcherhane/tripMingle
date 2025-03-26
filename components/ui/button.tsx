// components/ui/button.tsx
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Typography } from "./typography";
import { View } from "react-native";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const getButtonSize = (): ViewStyle => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          borderRadius: spacing.sm,
        };
      case "lg":
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xl,
          borderRadius: spacing.lg,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: spacing.md,
        };
    }
  };

  const getTextSize = (): "sm" | "md" | "lg" => {
    switch (size) {
      case "sm":
        return "sm";
      case "lg":
        return "lg";
      default:
        return "md";
    }
  };

  const buttonStyles = [
    styles.button,
    getButtonSize(),
    variant === "secondary" && styles.buttonSecondary,
    disabled && styles.buttonDisabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles = [
    styles.buttonText,
    variant === "secondary" && styles.buttonTextSecondary,
    disabled && styles.buttonTextDisabled,
    textStyle,
  ].filter(Boolean) as TextStyle[];

  const iconColor = disabled
    ? colors.gray[500]
    : variant === "secondary"
    ? colors.primary.brand
    : colors.primary.lightest;

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 16;
      case "lg":
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size={size === "sm" ? "small" : "small"}
          color={
            variant === "primary"
              ? colors.primary.lightest
              : colors.primary.brand
          }
        />
      ) : (
        <React.Fragment>
          {/* Content container for proper icon alignment */}
          <View
            style={[
              styles.contentContainer,
              {
                gap: spacing[size],
              },
            ]}
          >
            {leftIcon && (
              <View>
                {React.cloneElement(leftIcon as React.ReactElement, {
                  size: getIconSize(),
                  color: iconColor,
                })}
              </View>
            )}

            {title ? (
              <Typography
                variant={getTextSize()}
                weight={size === "sm" ? "medium" : "semibold"}
                style={StyleSheet.flatten([textStyles])}
                numberOfLines={1}
              >
                {title}
              </Typography>
            ) : null}

            {rightIcon && (
              <View>
                {React.cloneElement(rightIcon as React.ReactElement, {
                  size: getIconSize(),
                  color: iconColor,
                })}
              </View>
            )}
          </View>
        </React.Fragment>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary.brand,
  },
  buttonDisabled: {
    backgroundColor: colors.gray[300],
    borderColor: colors.gray[500],
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.primary.lightest,
  },
  buttonTextSecondary: {
    color: colors.primary.brand,
  },
  buttonTextDisabled: {
    color: colors.gray[500],
  },
});
