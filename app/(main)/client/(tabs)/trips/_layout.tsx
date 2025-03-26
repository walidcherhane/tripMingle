import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

export default function TripsLayout() {
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
          title: "My Trips",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Trip Details",
          headerBackTitle: "Trips",
        }}
      />
    </Stack>
  );
}
