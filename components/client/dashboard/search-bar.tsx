import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { MapPin } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { router } from "expo-router";
import { useBooking } from "@/context/BookingContext";

export const SearchBar = () => {
  const { getSpacing, colors } = useTheme();
  const { resetBooking } = useBooking();

  const handlePress = async () => {
    // Reset the booking state when starting a new search
    console.log("[DEBUG] Resetting booking state from dashboard search");
    resetBooking();

    // Navigate to the booking screen
    router.navigate("/client/booking");
  };

  return (
    <View style={styles.searchSection}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.searchBar,
          {
            padding: getSpacing("lg"),
            borderRadius: getSpacing("md"),
            backgroundColor: colors.gray[50],
            borderWidth: 1,
            borderColor: colors.gray[100],
          },
        ]}
      >
        <View style={styles.searchInputContainer}>
          <MapPin size={20} color={colors.primary.brand} />
          <View style={{ marginLeft: getSpacing("sm") }}>
            {/* <GoogleTextInput handlePress={handlePress} /> */}

            <Typography variant="xs" color="gray.400">
              Current Location
            </Typography>
            <Typography variant="sm" weight="medium" color="primary.dark">
              Where are you going?
            </Typography>
          </View>
        </View>
        <View style={styles.searchIcon}></View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  searchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.brand + "10",
    alignItems: "center",
    justifyContent: "center",
  },
});
