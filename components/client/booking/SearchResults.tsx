import React from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MapPin, Clock } from "lucide-react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { LocationData } from "@/types/booking";
import { PlaceAutocompletePrediction } from "@/types/place";

interface SearchResultsProps {
  isSearching: boolean;
  predictions: PlaceAutocompletePrediction[];
  searchQuery: string;
  recentLocations: LocationData[];
  onSelectPlace: (prediction: PlaceAutocompletePrediction) => void;
  onSelectRecentLocation: (location: LocationData) => void;
}

export function SearchResults({
  isSearching,
  predictions,
  searchQuery,
  recentLocations,
  onSelectPlace,
  onSelectRecentLocation,
}: SearchResultsProps) {
  const theme = useTheme();

  const renderPlaceItem = ({ item }: { item: PlaceAutocompletePrediction }) => (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => onSelectPlace(item)}
    >
      <View style={styles.predictionIconContainer}>
        <MapPin size={20} color={theme.getColor("gray.500")} />
      </View>
      <View style={styles.predictionTextContainer}>
        <Typography variant="md" numberOfLines={1}>
          {item.structured_formatting.main_text}
        </Typography>
        <Typography variant="sm" color="gray.500" numberOfLines={1}>
          {item.structured_formatting.secondary_text}
        </Typography>
      </View>
    </TouchableOpacity>
  );

  const renderRecentLocationItem = ({ item }: { item: LocationData }) => (
    <TouchableOpacity
      style={styles.predictionItem}
      onPress={() => onSelectRecentLocation(item)}
    >
      <View style={styles.predictionIconContainer}>
        <Clock size={20} color={theme.getColor("gray.500")} />
      </View>
      <View style={styles.predictionTextContainer}>
        <Typography variant="md" numberOfLines={1}>
          {item.placeName || item.address.split(",")[0]}
        </Typography>
        <Typography variant="sm" color="gray.500" numberOfLines={1}>
          {item.address}
        </Typography>
      </View>
    </TouchableOpacity>
  );

  if (isSearching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.getColor("primary.brand")} />
      </View>
    );
  }

  if (predictions.length > 0) {
    return (
      <FlatList
        data={predictions}
        renderItem={renderPlaceItem}
        keyExtractor={(item) => item.place_id || ""}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsList}
      />
    );
  }

  if (searchQuery.length > 0 && !isSearching) {
    return (
      <View style={styles.noResultsContainer}>
        <Typography variant="md" color="gray.500" align="center">
          No locations found
        </Typography>
        <Typography variant="sm" color="gray.400" align="center">
          Try a different search term
        </Typography>
      </View>
    );
  }

  return (
    <View>
      <Typography variant="md" weight="semibold" style={styles.recentHeader}>
        Recent Locations
      </Typography>
      <FlatList
        data={recentLocations}
        renderItem={renderRecentLocationItem}
        keyExtractor={(item, index) => `recent-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  resultsList: {
    paddingBottom: 20,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  predictionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  predictionTextContainer: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsContainer: {
    padding: 40,
    alignItems: "center",
  },
  recentHeader: {
    marginVertical: 12,
  },
  currentLocationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
});
