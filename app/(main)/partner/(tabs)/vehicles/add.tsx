import React from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import VehicleForm from "@/components/partner/vehicle/vehicle-form";
import { SafeAreaView } from "react-native-safe-area-context";

const AddVehiclePage = () => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Add Vehicle",
          headerShadowVisible: false,
        }}
      />
      <VehicleForm />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AddVehiclePage;
