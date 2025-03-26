import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { Stack, router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import {
  User,
  Settings,
  CreditCard,
  Bell,
  Languages,
  HelpCircle,
  ChevronRight,
  LogOut,
  CheckCircle,
  MapPin,
} from "lucide-react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/dist/react";

const menuItems = [
  {
    id: "personal",
    title: "Personal Information",
    icon: User,
    route: "/(main)/client/(tabs)/profile/personal",
  },
  {
    id: "payment",
    title: "Payment Methods",
    icon: CreditCard,
    route: "/(main)/client/(tabs)/profile/payment",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    route: "/(main)/client/(tabs)/profile/notifications",
  },
  {
    id: "language",
    title: "Language",
    subtitle: "English",
    icon: Languages,
    route: "/(main)/client/(tabs)/profile/language",
  },
  {
    id: "help",
    title: "Help & Support",
    icon: HelpCircle,
    route: "/(main)/client/(tabs)/profile/support",
  },
];

export default function ClientProfileScreen() {
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.auth.getMe);
  const savedLocations = useQuery(api.savedLocations.getAllLocations, {
    userId: currentUser?._id!,
  });

  const userTrips = useQuery(api.trips.getClientTrips, {
    clientId: currentUser?._id!,
  });
  const theme = useTheme();

  const handleLogout = () => {
    void signOut().then(() => {
      router.replace("/(auth)/login");
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primary.lightest },
              ]}
            >
              {currentUser?.profileImage ? (
                <Image
                  source={{ uri: currentUser.profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Typography
                  variant="2xl"
                  style={{ color: theme.colors.primary.brand }}
                >
                  {currentUser?.firstName?.charAt(0)}
                  {currentUser?.lastName?.charAt(0)}
                </Typography>
              )}
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Typography variant="xl" weight="semibold">
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              {currentUser?.email}
            </Typography>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Typography variant="2xl" weight="bold">
              {userTrips?.length || 0}
            </Typography>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              Trips
            </Typography>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Typography variant="2xl" weight="bold">
              {savedLocations?.length || 0}
            </Typography>
            <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
              Saved Locations
            </Typography>
          </View>
        </View>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.menuItem,
              index < menuItems.length - 1 && styles.menuBorder,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.menuContent}>
              <item.icon size={20} color={theme.colors.gray[500]} />
              <View style={styles.menuText}>
                <Typography variant="md" weight="medium">
                  {item.title}
                </Typography>
                {item.subtitle && (
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    {item.subtitle}
                  </Typography>
                )}
              </View>
              <ChevronRight size={20} color={theme.colors.gray[400]} />
            </View>
          </Pressable>
        ))}
      </Card>

      {/* Logout Button */}
      <Card style={styles.logoutCard}>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={theme.colors.error} />
          <Typography
            variant="md"
            weight="medium"
            style={{ color: theme.colors.error, marginLeft: 12 }}
          >
            Log Out
          </Typography>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerButton: {
    padding: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  profileCard: {
    margin: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 2,
  },
  profileInfo: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
  },
  menuCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  menuItem: {
    paddingVertical: 16,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
  },
  logoutCard: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
});
