// components/booking/LocationPicker.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  MapPin,
  Navigation,
  X,
  LocateFixed,
  Clock,
  Search,
} from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationData } from "@/types/booking";

interface LocationPickerProps {
  isPickup: boolean;
  value: LocationData;
  onChange: (location: LocationData) => void;
  onFocus?: () => void;
  onReset?: () => void;
  onUseCurrentLocation?: () => void;
}

interface LocationSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  isPickup,
  value,
  onChange,
  onFocus,
  onReset,
  onUseCurrentLocation,
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState(value.address || "");
  const [isFocused, setIsFocused] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [recentLocations, setRecentLocations] = useState<LocationData[]>([]);

  useEffect(() => {
    // Update input value when value changes externally
    if (value.address) {
      setInputValue(value.address);
    }
  }, [value.address]);

  useEffect(() => {
    // Load recent locations
    // This would be replaced with actual saved locations from storage
    const mockRecentLocations: LocationData[] = [
      {
        address: "Home - 123 Resident St",
        placeName: "Home",
        latitude: 31.6295,
        longitude: -7.9811,
        city: "Marrakech",
      },
      {
        address: "Work - 456 Office Ave",
        placeName: "Work",
        latitude: 33.5731,
        longitude: -7.5898,
        city: "Casablanca",
      },
      {
        address: "Marrakech Menara Airport",
        placeName: "Airport",
        latitude: 31.6068,
        longitude: -8.0363,
        city: "Marrakech",
      },
    ];

    setRecentLocations(mockRecentLocations);
  }, []);

  const handleInputChange = (text: string) => {
    setInputValue(text);

    if (text.length > 2) {
      searchLocations(text);
    } else {
      setSuggestions([]);
    }
  };

  const searchLocations = async (query: string) => {
    setIsSearching(true);

    try {
      // This would be replaced with actual geocoding API call
      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock suggestions
      if (query.length > 2) {
        const mockSuggestions: LocationSuggestion[] = [
          {
            placeId: "1",
            mainText: `${query} Street`,
            secondaryText: "Marrakech, Morocco",
            fullText: `${query} Street, Marrakech, Morocco`,
          },
          {
            placeId: "2",
            mainText: `${query} Avenue`,
            secondaryText: "Casablanca, Morocco",
            fullText: `${query} Avenue, Casablanca, Morocco`,
          },
          {
            placeId: "3",
            mainText: `${query} Hotel`,
            secondaryText: "Rabat, Morocco",
            fullText: `${query} Hotel, Rabat, Morocco`,
          },
        ];

        setSuggestions(mockSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error searching locations:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    // This would be replaced with actual geocoding to get coordinates
    // Mock coordinates
    const mockLocation: LocationData = {
      address: suggestion.fullText,
      placeName: suggestion.mainText,
      latitude: 31.6295 + Math.random() * 0.1,
      longitude: -7.9811 + Math.random() * 0.1,
      city: suggestion.secondaryText.split(",")[0],
    };

    setInputValue(suggestion.fullText);
    setSuggestions([]);
    onChange(mockLocation);
    setIsFocused(false);
  };

  const handleSelectRecentLocation = (location: LocationData) => {
    setInputValue(location.address);
    onChange(location);
    setIsFocused(false);
  };

  const handleClear = () => {
    setInputValue("");
    if (onReset) {
      onReset();
    }
  };

  const handleUseCurrentLocation = () => {
    if (onUseCurrentLocation) {
      onUseCurrentLocation();
    } else {
      // Mock current location if handler not provided
      const mockCurrentLocation: LocationData = {
        address: "Current Location",
        latitude: 31.6295,
        longitude: -7.9811,
        city: "Marrakech",
      };

      setInputValue("Current Location");
      onChange(mockCurrentLocation);
    }

    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          {
            borderColor: theme.getColor(
              isFocused ? "primary.brand" : "gray.300"
            ),
          },
        ]}
      >
        <View style={styles.iconContainer}>
          {isPickup ? (
            <MapPin size={20} color={theme.getColor("primary.brand")} />
          ) : (
            <Navigation size={20} color={theme.getColor("primary.brand")} />
          )}
        </View>

        <TextInput
          style={[
            styles.input,
            {
              color: theme.getColor("text"),
              fontFamily: theme.typography.fontFamily,
            },
          ]}
          placeholder={isPickup ? "Pickup location" : "Destination"}
          placeholderTextColor={theme.getColor("gray.400")}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={() => {
            setIsFocused(true);
            if (onFocus) onFocus();
          }}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />

        {isSearching && (
          <ActivityIndicator
            size="small"
            color={theme.getColor("primary.brand")}
            style={styles.rightIconContainer}
          />
        )}

        {!isSearching && inputValue && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={handleClear}
          >
            <X size={18} color={theme.getColor("gray.500")} />
          </TouchableOpacity>
        )}
      </View>

      {isFocused && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.suggestionsContainer}
        >
          <ScrollView
            style={[
              styles.suggestionsScrollView,
              { backgroundColor: theme.getColor("background") },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Current location option */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleUseCurrentLocation}
            >
              <View style={styles.optionIconContainer}>
                <LocateFixed
                  size={18}
                  color={theme.getColor("primary.brand")}
                />
              </View>
              <View>
                <Typography variant="md" weight="medium">
                  Use current location
                </Typography>
              </View>
            </TouchableOpacity>

            {/* Recent locations */}
            {recentLocations.length > 0 && !inputValue && (
              <View style={styles.sectionContainer}>
                <Typography
                  variant="sm"
                  color="gray.500"
                  style={styles.sectionTitle}
                >
                  Recent Locations
                </Typography>

                {recentLocations.map((location, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => handleSelectRecentLocation(location)}
                  >
                    <View style={styles.optionIconContainer}>
                      <Clock size={18} color={theme.getColor("gray.500")} />
                    </View>
                    <View>
                      <Typography variant="md" weight="medium">
                        {location.placeName || location.address}
                      </Typography>
                      {location.placeName && (
                        <Typography variant="sm" color="gray.500">
                          {location.address}
                        </Typography>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Location suggestions */}
            {suggestions.length > 0 && (
              <View style={styles.sectionContainer}>
                <Typography
                  variant="sm"
                  color="gray.500"
                  style={styles.sectionTitle}
                >
                  Suggestions
                </Typography>

                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.optionItem}
                    onPress={() => handleSelectSuggestion(suggestion)}
                  >
                    <View style={styles.optionIconContainer}>
                      <Search size={18} color={theme.getColor("gray.500")} />
                    </View>
                    <View>
                      <Typography variant="md" weight="medium">
                        {suggestion.mainText}
                      </Typography>
                      <Typography variant="sm" color="gray.500">
                        {suggestion.secondaryText}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No results message */}
            {inputValue && !isSearching && suggestions.length === 0 && (
              <View style={styles.noResultsContainer}>
                <Typography variant="md" color="gray.500" align="center">
                  No locations found
                </Typography>
                <Typography variant="sm" color="gray.400" align="center">
                  Try a different search term
                </Typography>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  iconContainer: {
    paddingHorizontal: 12,
  },
  rightIconContainer: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 100,
    maxHeight: 300,
  },
  suggestionsScrollView: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionIconContainer: {
    width: 40,
    alignItems: "center",
  },
  noResultsContainer: {
    paddingVertical: 24,
    alignItems: "center",
  },
});

export default LocationPicker;
