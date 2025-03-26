import { colors } from "@/theme/colors";
import { Tabs } from "expo-router";
import { Bell, Home, MapPin, Route, User } from "lucide-react-native";
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
          tabBarIcon: ({ color }) => <Home color={color} />,
          tabBarLabel: "Home",
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
        name="locations"
        options={{
          tabBarIcon: ({ color }) => <MapPin color={color} />,
          tabBarLabel: "Locations",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color }) => <Bell color={color} />,
          tabBarLabel: "Notifications",
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
