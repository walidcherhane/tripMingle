import { Stack } from "expo-router";
import React from "react";

function _layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}

export default _layout;
