// components/ui/list-item.tsx
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Typography } from "./typography";
import { useTheme } from "@/hooks/useTheme";
import { ChevronRight } from "lucide-react-native";

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  leftIcon?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  rightText,
  leftIcon,
  onPress,
  showChevron = true,
}) => {
  const theme = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.getSpacing("sm"),
        },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        {leftIcon && (
          <View
            style={[
              styles.iconContainer,
              { marginRight: theme.getSpacing("sm") },
            ]}
          >
            {leftIcon}
          </View>
        )}

        <View style={styles.textContainer}>
          <Typography
            variant="md"
            weight="medium"
            style={{ color: theme.colors.text }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              {subtitle}
            </Typography>
          )}
        </View>

        <View style={styles.rightContainer}>
          {rightText && (
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              {rightText}
            </Typography>
          )}
          {showChevron && onPress && (
            <ChevronRight size={20} color={theme.colors.gray[400]} />
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
