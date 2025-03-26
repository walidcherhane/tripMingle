// components/ui/card.tsx
import React from "react";
import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  variant?: "default" | "outlined" | "flat";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = "flat",
}) => {
  const theme = useTheme();

  const getCardStyle = () => {
    switch (variant) {
      case "outlined":
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case "flat":
        return {
          backgroundColor: theme.colors.background,
          padding: theme.getSpacing("md"),
        };
      default:
        return {
          backgroundColor: theme.colors.background,
          ...theme.shadows.sm,
        };
    }
  };

  const cardStyle = [
    styles.card,
    {
      borderRadius: theme.borderRadius.md,
      padding: theme.getSpacing("md"),
    },
    getCardStyle(),
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});
