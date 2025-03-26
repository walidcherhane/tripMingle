import { colors } from "@/theme/colors";
import { Tabs } from "expo-router";
import {
  Bell,
  Car,
  LayoutDashboard,
  Route,
  User,
  Settings,
} from "lucide-react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function TabsLayout() {
  // Get the current user directly without using the routing hook
  // This prevents redirection loops
  const currentUser = useQuery(api.auth.getMe);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary.brand }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} />,
          tabBarLabel: "Dashboard",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          tabBarIcon: ({ color }) => <Route color={color} />,
          tabBarLabel: "Trips",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          tabBarIcon: ({ color }) => <Car color={color} />,
          tabBarLabel: "Vehicles",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications/index"
        options={{
          tabBarIcon: ({ color }) => <Bell color={color} />,
          tabBarLabel: "Notifications",
          tabBarBadge: 1,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <User color={color} />,
          tabBarLabel: "Profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

export default TabsLayout;
