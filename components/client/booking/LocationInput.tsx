import React from "react";
import { StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import { MapPin, Navigation, Search, X } from "lucide-react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { LocationData } from "@/types/booking";

interface LocationInputProps {
  pickup: LocationData;
  dropoff: LocationData;
  searchQuery: string;
  searchLocationType: "pickup" | "dropoff";
  searchFocused: boolean;
  onRequestSearch: (type: "pickup" | "dropoff") => void;
  onSearchChange: (text: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
}

export function LocationInput({
  pickup,
  dropoff,
  searchQuery,
  searchLocationType,
  searchFocused,
  onRequestSearch,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
}: LocationInputProps) {
  const theme = useTheme();

  return (
    <>
      {/* Pickup location (visible in normal view) */}
      {!searchFocused && (
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => {
            onRequestSearch("pickup");
          }}
        >
          <View
            style={[
              styles.locationIconContainer,
              { backgroundColor: theme.getColor("primary.brand") + "20" },
            ]}
          >
            <MapPin size={20} color={theme.getColor("primary.brand")} />
          </View>
          <View style={styles.locationTextContainer}>
            <Typography variant="sm" color="gray.500">
              Pickup
            </Typography>
            <Typography variant="md" numberOfLines={1}>
              {pickup.address || "Current Location"}
            </Typography>
          </View>
        </TouchableOpacity>
      )}

      {/* Destination search input */}
      {!searchFocused ? (
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => {
            onRequestSearch("dropoff");
          }}
        >
          <View
            style={[
              styles.locationIconContainer,
              { backgroundColor: theme.getColor("error") + "20" },
            ]}
          >
            <Navigation size={20} color={theme.getColor("error")} />
          </View>
          <View style={styles.locationTextContainer}>
            <Typography variant="sm" color="gray.500">
              Destination
            </Typography>
            <Typography variant="md" numberOfLines={1}>
              {dropoff.placeName || "Where are you going?"}
            </Typography>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.searchInputContainer}>
          {!searchFocused && (
            <View
              style={[
                styles.locationIconContainer,
                { backgroundColor: theme.getColor("error") + "20" },
              ]}
            >
              <Navigation size={20} color={theme.getColor("error")} />
            </View>
          )}
          {
            <View
              style={[
                styles.searchInputWrapper,
                searchFocused && styles.searchInputWrapperFocused,
                {
                  borderColor: searchFocused
                    ? theme.getColor("primary.brand")
                    : theme.getColor("gray.300"),
                },
              ]}
            >
              <Search
                size={20}
                color={theme.getColor(
                  searchFocused ? "primary.brand" : "gray.500"
                )}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput]}
                placeholder={`Search for ${
                  searchLocationType === "pickup" ? "pickup" : "dropoff"
                } location`}
                placeholderTextColor={theme.getColor("gray.400")}
                value={searchQuery}
                onChangeText={onSearchChange}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={onClearSearch}
                >
                  <X size={18} color={theme.getColor("gray.500")} />
                </TouchableOpacity>
              )}
            </View>
          }
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#FFFFFF",
  },
  searchInputWrapperFocused: {
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
});
