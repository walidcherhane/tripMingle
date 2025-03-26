// src/components/Typography.tsx
import { useTheme } from "@/hooks/useTheme";
import { ColorKey, Colors, FontSizeKey, WeightKey } from "@/types/theme";
import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { TextProps } from "react-native-svg";

interface TypographyProps extends TextProps {
  variant?: FontSizeKey;
  weight?: WeightKey;
  color?: ColorKey;
  align?: "left" | "center" | "right";
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "md",
  color,
  weight = "normal",
  align = "left",
  children,
  style,
  ...rest
}) => {
  const theme = useTheme();

  if (children === null || children === undefined) {
    return null;
  }

  const getVariantStyles = (variant: FontSizeKey): TextStyle => {
    const styles: Record<FontSizeKey, TextStyle> = {
      xs: {
        fontSize: theme.typography.sizes.xs,
        lineHeight:
          theme.typography.lineHeights.normal * theme.getFontSize("xs"),
      },
      sm: {
        fontSize: theme.typography.sizes.sm,
        lineHeight:
          theme.typography.lineHeights.normal * theme.getFontSize("sm"),
      },
      md: {
        fontSize: theme.typography.sizes.md,
        lineHeight:
          theme.typography.lineHeights.normal * theme.getFontSize("md"),
      },
      lg: {
        fontSize: theme.typography.sizes.lg,
        lineHeight:
          theme.typography.lineHeights.normal * theme.getFontSize("lg"),
      },
      xl: {
        fontSize: theme.typography.sizes.xl,
        lineHeight:
          theme.typography.lineHeights.normal * theme.getFontSize("xl"),
      },
      "2xl": {
        fontSize: theme.typography.sizes["2xl"],
        lineHeight:
          theme.typography.lineHeights.normal * theme.getFontSize("2xl"),
      },
      "3xl": {
        fontSize: theme.typography.sizes["3xl"],
        lineHeight:
          theme.typography.lineHeights.normal * theme.getFontSize("3xl"),
      },
      "4xl": {
        fontSize: theme.typography.sizes["4xl"],
        lineHeight:
          theme.typography.lineHeights.normal * theme.getFontSize("4xl"),
      },
    };

    return styles[variant];
  };

  const styles = StyleSheet.create({
    text: {
      fontFamily: theme.typography.fontFamily,
      ...getVariantStyles(variant),
      ...(weight && { fontWeight: theme.typography.weights[weight] }),
      color: color ? theme.getColor(color) : theme.getColor("text"),
      textAlign: align,
    },
  });

  return (
    <Text style={[styles.text, style]} {...rest}>
      {children}
    </Text>
  );
};
