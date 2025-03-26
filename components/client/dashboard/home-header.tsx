import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Bell, User } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const HomeHeader = () => {
  const currentUser = useQuery(api.auth.getMe);
  const { getSpacing, colors } = useTheme();

  return (
    <View style={[styles.container, { padding: getSpacing("lg") }]}>
      <View style={styles.userSection}>
        <TouchableOpacity style={styles.profileButton}>
          <User size={20} color={colors.primary.brand} />
        </TouchableOpacity>
        <View style={{ marginLeft: getSpacing("sm") }}>
          <Typography variant="sm" color="gray.500">
            Good Morning 👋
          </Typography>
          <Typography variant="lg" weight="bold" color="primary.dark">
            {currentUser?.firstName} {currentUser?.lastName}
          </Typography>
        </View>
      </View>

      <TouchableOpacity style={styles.notificationButton}>
        <Bell size={20} color={colors.primary.dark} />
        <View style={styles.notificationBadge} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F7F9",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
});
