import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { LocateFixed, ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";

interface MapControlsProps {
  topInset: number;
  onUseCurrentLocation: () => void;
}

export function MapControls({
  topInset,
  onUseCurrentLocation,
}: MapControlsProps) {
  const theme = useTheme();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      {/* Current location button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { backgroundColor: theme.getColor("background") },
          { top: topInset + 16 },
        ]}
        onPress={onUseCurrentLocation}
      >
        <LocateFixed size={20} color={theme.getColor("primary.brand")} />
      </TouchableOpacity>

      {/* Back button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { backgroundColor: theme.getColor("background") },
          { top: topInset + 16, left: 16 },
        ]}
        onPress={handleBack}
      >
        <ArrowLeft size={20} color={theme.getColor("primary.brand")} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
