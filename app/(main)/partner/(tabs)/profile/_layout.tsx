import { Stack } from "expo-router";
import React from "react";

function _layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="personal"
        options={{
          title: "Personal Information",
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: "Payment Methods",
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: "Notifications",
        }}
      />
      <Stack.Screen
        name="language"
        options={{
          title: "Language",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="support"
        options={{
          title: "Help & Support",
        }}
      />
    </Stack>
  );
}

export default _layout;
