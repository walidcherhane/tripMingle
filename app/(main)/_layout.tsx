import { Stack } from "expo-router";
import React from "react";
import "react-native-get-random-values";

function _layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="partner"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="client"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default _layout;
