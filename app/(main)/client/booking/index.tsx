// app/(main)/client/booking/index.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBooking } from "@/context/BookingContext";
import { LocationData, BookingStep } from "@/types/booking";
import { PlaceAutocompletePrediction } from "@/types/place";

// Import custom hooks
import { useLocationSearch } from "@/hooks/client/booking/useLocationSearch";
import { useMapControl } from "@/hooks/client/booking/useMapControl";
import { useBottomSheetControl } from "@/hooks/client/booking/useBottomSheetControl";

// Import components
import { BookingMap } from "@/components/client/booking/BookingMap";
import { MapControls } from "@/components/client/booking/MapControls";
import { LocationBottomSheet } from "@/components/client/booking/LocationBottomSheet";
import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

export default function BookingScreen() {
  const { top: topInset } = useSafeAreaInsets();
  const {
    setLocations,
    goToNextStep,
    isLoadingDistanceMatrix,
    routeEstimate,
    bookingData,
    goToStep,
    currentStep,
  } = useBooking();

  // Make sure we're on the correct step (LOCATION) when this screen mounts
  useEffect(() => {
    console.log(
      "[DEBUG] LocationScreen mounted with current step:",
      currentStep
    );

    // Set the current step to LOCATION to ensure proper navigation
    if (currentStep !== BookingStep.LOCATION) {
      console.log("[DEBUG] Setting step to LOCATION");
      goToStep(BookingStep.LOCATION);
    }
  }, []);

  // Initialize custom hooks
  const locationSearch = useLocationSearch();
  const mapControl = useMapControl();
  const bottomSheet = useBottomSheetControl();

  // Initialize with booking data if available
  useEffect(() => {
    if (bookingData.pickupLocation) {
      locationSearch.setPickup(bookingData.pickupLocation);
    }

    if (bookingData.dropoffLocation) {
      locationSearch.setDropoff(bookingData.dropoffLocation);
    }
  }, []);

  // Check location permission and get current location on mount
  useEffect(() => {
    (async () => {
      const hasPermission = await locationSearch.checkLocationPermission();
      if (hasPermission) {
        const currentLocation = await locationSearch.getCurrentLocation();
        if (currentLocation && locationSearch.pickup.latitude === 0) {
          locationSearch.setPickup(currentLocation);
          mapControl.updateMapRegion(
            currentLocation.latitude,
            currentLocation.longitude
          );
        }
      }
    })();
  }, []);

  // Adjust map when sheet index changes
  useEffect(() => {
    if (bottomSheet.currentSnapIndex === 0) {
      mapControl.adjustMapToShowMarkers(
        locationSearch.pickup,
        locationSearch.dropoff
      );
    }
  }, [bottomSheet.currentSnapIndex]);

  // Handler functions
  const handleUseCurrentLocation = async () => {
    bottomSheet.expandSheet();
    const currentLocation = await locationSearch.setCurrentLocationAsPickup();
    if (currentLocation) {
      mapControl.updateMapRegion(
        currentLocation.latitude,
        currentLocation.longitude
      );
    }
  };

  const handleRequestSearch = (type: "pickup" | "dropoff") => {
    locationSearch.setSearchLocationType(type);
    bottomSheet.setSearchFocused(true);
    bottomSheet.expandSheet();
    locationSearch.setSearchQuery(
      type === "pickup"
        ? locationSearch.pickup.address
        : locationSearch.dropoff.address
    );
    locationSearch.setPredictions([]);
  };

  const handleSelectPlace = async (prediction: PlaceAutocompletePrediction) => {
    const locationData = await locationSearch.handleSelectPlace(prediction);
    if (locationData) {
      bottomSheet.collapseSheet();
      setLocations(
        bookingData.pickupLocation ? bookingData.pickupLocation : locationData,
        bookingData.dropoffLocation ? bookingData.dropoffLocation : locationData
      );

      // Adjust map to show both markers
      setTimeout(() => {
        mapControl.adjustMapToShowMarkers(
          locationSearch.pickup,
          locationSearch.dropoff
        );
      }, 300);
    }
  };

  const handleSelectRecentLocation = (location: LocationData) => {
    locationSearch.handleSelectRecentLocation(location);
    bottomSheet.collapseSheet();

    // Adjust map to show both markers
    setTimeout(() => {
      mapControl.adjustMapToShowMarkers(
        locationSearch.pickup,
        locationSearch.dropoff
      );
    }, 300);
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <BookingMap
        mapRef={mapControl.mapRef}
        mapRegion={mapControl.mapRegion}
        customMapStyle={mapControl.CUSTOM_MAP_STYLE}
        pickup={locationSearch.pickup}
        dropoff={locationSearch.dropoff}
        hasLocationPermission={locationSearch.hasLocationPermission}
      />

      {/* Map Controls */}
      <MapControls
        topInset={topInset}
        onUseCurrentLocation={handleUseCurrentLocation}
      />

      {/* Bottom Sheet */}
      <LocationBottomSheet
        bottomSheetRef={bottomSheet.bottomSheetRef}
        snapPoints={bottomSheet.snapPoints}
        handleSheetChange={bottomSheet.handleSheetChange}
        searchFocused={bottomSheet.searchFocused}
        searchLocationType={locationSearch.searchLocationType}
        pickup={locationSearch.pickup}
        dropoff={locationSearch.dropoff}
        searchQuery={locationSearch.searchQuery}
        predictions={locationSearch.predictions}
        isSearching={locationSearch.isSearching}
        recentLocations={locationSearch.recentLocations}
        isLoadingDistanceMatrix={isLoadingDistanceMatrix}
        routeEstimate={routeEstimate}
        onRequestSearch={handleRequestSearch}
        onSearchChange={locationSearch.handleSearchChange}
        onSearchFocus={bottomSheet.handleSearchFocus}
        onSearchBlur={() =>
          bottomSheet.handleSearchBlur(locationSearch.predictions.length > 0)
        }
        onClearSearch={locationSearch.handleClearSearch}
        onSelectPlace={handleSelectPlace}
        onSelectRecentLocation={handleSelectRecentLocation}
        onNext={goToNextStep}
        setSearchFocused={bottomSheet.setSearchFocused}
        renderBackdrop={(props) => (
          <BottomSheetBackdrop
            disappearsOnIndex={0}
            appearsOnIndex={1}
            opacity={0.5}
            {...props}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
