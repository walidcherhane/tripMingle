import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function NotificationsLayout() {
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
          headerTitle: "Notifications",
        }}
      />
    </Stack>
  );
}
