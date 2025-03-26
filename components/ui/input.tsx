import React, { forwardRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { Typography } from "@/components/ui/typography";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      ...props
    },
    ref
  ) => {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Typography style={[styles.label, labelStyle as TextStyle]}>
            {label}
          </Typography>
        )}
        <View style={[styles.inputContainer, error && styles.inputError]}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={
              [
                styles.input,
                leftIcon && styles.inputWithLeftIcon,
                rightIcon && styles.inputWithRightIcon,
                inputStyle,
              ].filter(Boolean) as TextStyle[]
            }
            placeholderTextColor={colors.gray[400]}
            {...props}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
        {error && (
          <Typography style={[styles.error, errorStyle as TextStyle]}>
            {error}
          </Typography>
        )}
      </View>
    );
  }
);

// Add display name for better debugging
Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: "500",
    marginBottom: spacing.xs,
    color: colors.gray[700],
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: spacing.sm,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.gray[900],
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: spacing.xs,
  },
  leftIcon: {
    paddingLeft: spacing.sm,
  },
  rightIcon: {
    paddingRight: spacing.sm,
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
