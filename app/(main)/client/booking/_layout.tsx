// app/(main)/booking/_layout.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
// BookingProvider is now provided at the client layout level
import { useTheme } from "@/hooks/useTheme";

export default function BookingLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.getColor("background"),
        },
        headerShadowVisible: false,
        headerTintColor: theme.getColor("primary.dark"),
        headerTitleStyle: {
          fontFamily: theme.typography.fontFamily,
          fontWeight: theme.typography.weights.semibold,
        },
        contentStyle: {
          backgroundColor: theme.getColor("background"),
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          title: "Trip Details",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="rides"
        options={{
          title: "Available Rides",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="confirmation"
        options={{
          title: "Booking Summary",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: "Payment",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="active"
        options={{
          title: "Active Trip",
          headerShown: false,
          animation: "fade",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
