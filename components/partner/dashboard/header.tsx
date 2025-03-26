import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { Bell, Settings } from "lucide-react-native";

interface HeaderProps {
  userName: string;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  userName,
  onNotificationsPress,
  onSettingsPress,
}) => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View>
        <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
          Welcome back,
        </Typography>
        <Typography
          variant="xl"
          weight="bold"
          style={{ color: theme.colors.text }}
        >
          {userName}
        </Typography>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: theme.colors.gray[100],
              borderRadius: theme.borderRadius.full,
            },
            pressed && styles.pressed,
          ]}
          onPress={onNotificationsPress}
        >
          <Bell size={20} color={theme.colors.gray[700]} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: theme.colors.gray[100],
              borderRadius: theme.borderRadius.full,
            },
            pressed && styles.pressed,
          ]}
          onPress={onSettingsPress}
        >
          <Settings size={20} color={theme.colors.gray[700]} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
