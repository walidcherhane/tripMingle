import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetFooter,
} from "@gorhom/bottom-sheet";
import { ChevronLeft, Clock, MapPin } from "lucide-react-native";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { LocationData } from "@/types/booking";
import { PlaceAutocompletePrediction } from "@/types/place";
import { LocationInput } from "./LocationInput";
import { SearchResults } from "./SearchResults";
import Skeleton from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react-native";
import { spacing } from "@/theme/spacing";
import { colors } from "@/theme/colors";

interface LocationBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  renderBackdrop: (props: any) => React.ReactNode;
  handleSheetChange: (index: number) => void;
  searchFocused: boolean;
  searchLocationType: "pickup" | "dropoff";
  pickup: LocationData;
  dropoff: LocationData;
  searchQuery: string;
  predictions: PlaceAutocompletePrediction[];
  isSearching: boolean;
  recentLocations: LocationData[];
  isLoadingDistanceMatrix: boolean;
  routeEstimate: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
  } | null;
  onRequestSearch: (type: "pickup" | "dropoff") => void;
  onSearchChange: (text: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onClearSearch: () => void;
  onSelectPlace: (prediction: PlaceAutocompletePrediction) => void;
  onSelectRecentLocation: (location: LocationData) => void;
  onNext: () => void;
  setSearchFocused: (focused: boolean) => void;
}

export function LocationBottomSheet({
  bottomSheetRef,
  snapPoints,
  renderBackdrop,
  handleSheetChange,
  searchFocused,
  searchLocationType,
  pickup,
  dropoff,
  searchQuery,
  predictions,
  isSearching,
  recentLocations,
  isLoadingDistanceMatrix,
  routeEstimate,
  onRequestSearch,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onClearSearch,
  onSelectPlace,
  onSelectRecentLocation,
  onNext,
  setSearchFocused,
}: LocationBottomSheetProps) {
  const theme = useTheme();

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={24}>
        {!searchFocused && (
          <View style={styles.bottomContainer}>
            {dropoff.latitude !== 0 && dropoff.longitude !== 0 && (
              <View style={styles.tripPreview}>
                <View style={styles.previewDetail}>
                  <Clock size={16} color={theme.getColor("gray.500")} />
                  {isLoadingDistanceMatrix ? (
                    <Skeleton
                      height={16}
                      width={60}
                      style={styles.previewText}
                    />
                  ) : (
                    <Typography
                      variant="sm"
                      color="gray.500"
                      style={styles.previewText}
                    >
                      ~{routeEstimate?.duration?.text || "Calculating..."}
                    </Typography>
                  )}
                </View>
                <View style={styles.previewDivider} />
                <View style={styles.previewDetail}>
                  <MapPin size={16} color={theme.getColor("gray.500")} />
                  {isLoadingDistanceMatrix ? (
                    <Skeleton
                      height={16}
                      width={60}
                      style={styles.previewText}
                    />
                  ) : (
                    <Typography
                      variant="sm"
                      color="gray.500"
                      style={styles.previewText}
                    >
                      ~{routeEstimate?.distance?.text || "Calculating..."}
                    </Typography>
                  )}
                </View>
              </View>
            )}
            <Button
              title="Continue"
              onPress={onNext}
              rightIcon={<ArrowRight />}
              style={styles.continueButton}
            />
          </View>
        )}
      </BottomSheetFooter>
    ),
    [searchFocused, dropoff, isLoadingDistanceMatrix, routeEstimate, theme]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      index={1}
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      handleIndicatorStyle={{ backgroundColor: theme.getColor("gray.400") }}
      backgroundStyle={{ backgroundColor: theme.getColor("background") }}
      enableDynamicSizing
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <BottomSheetView
          style={[
            styles.bottomSheetContent,
            {
              height: searchFocused ? "100%" : "auto",
            },
          ]}
        >
          {/* Search header - only shown in full screen mode */}
          {searchFocused && (
            <View style={styles.searchHeader}>
              <TouchableOpacity
                style={styles.backToSheetButton}
                onPress={() => {
                  setSearchFocused(false);
                  bottomSheetRef.current?.snapToIndex(-1);
                  Keyboard.dismiss();
                }}
              >
                <ChevronLeft size={24} color={theme.getColor("primary.dark")} />
              </TouchableOpacity>
              <Typography variant="lg" weight="semibold">
                Where {searchLocationType === "pickup" ? "from" : "to"}
              </Typography>
              <View style={styles.headerRight} />
            </View>
          )}

          {/* Location inputs */}
          <LocationInput
            pickup={pickup}
            dropoff={dropoff}
            searchQuery={searchQuery}
            searchLocationType={searchLocationType}
            searchFocused={searchFocused}
            onRequestSearch={onRequestSearch}
            onSearchChange={onSearchChange}
            onSearchFocus={onSearchFocus}
            onSearchBlur={onSearchBlur}
            onClearSearch={onClearSearch}
          />

          {/* Search results or recent locations */}
          {searchFocused && (
            <View style={styles.resultsContainer}>
              <SearchResults
                isSearching={isSearching}
                predictions={predictions}
                searchQuery={searchQuery}
                recentLocations={recentLocations}
                onSelectPlace={onSelectPlace}
                onSelectRecentLocation={onSelectRecentLocation}
              />
            </View>
          )}
        </BottomSheetView>
      </TouchableWithoutFeedback>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  bottomSheetContent: {
    padding: 16,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backToSheetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    width: 40,
  },
  resultsContainer: {
    flex: 1,
  },
  bottomContainer: {
    marginTop: spacing.lg,
    marginInline: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: colors.gray[300],
  },
  tripPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "center",
  },
  previewDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewText: {
    marginLeft: 4,
  },
  previewDivider: {
    height: 12,
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  continueButton: {
    width: "100%",
  },
});
