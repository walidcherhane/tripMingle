import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function ProfileLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontFamily: "InterSemiBold",
          fontSize: 18,
        },
        contentStyle: {
          backgroundColor: "#F3F4F6",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="personal"
        options={{
          headerTitle: "Personal Information",
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          headerTitle: "Payment Methods",
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerTitle: "Notifications",
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          headerTitle: "Language",
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          headerTitle: "Help & Support",
        }}
      />
    </Stack>
  );
}
