import { Stack } from "expo-router";
import React from "react";

function PartnerLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="verification-status"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="registration"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default PartnerLayout;
