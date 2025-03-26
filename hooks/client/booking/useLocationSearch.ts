import { useState, useCallback } from "react";
import { debounce } from "lodash";
import * as Location from "expo-location";
import { LocationData } from "@/types/booking";
import { PlaceAutocompletePrediction } from "@/types/place";
import { placesService } from "@/services/google/places";

export function useLocationSearch() {
  // Location states
  const [pickup, setPickup] = useState<LocationData>({
    address: "",
    latitude: 0,
    longitude: 0,
    city: "",
  });
  const [dropoff, setDropoff] = useState<LocationData>({
    address: "",
    latitude: 0,
    longitude: 0,
    city: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlaceAutocompletePrediction[]>(
    []
  );
  const [searchLocationType, setSearchLocationType] = useState<
    "pickup" | "dropoff"
  >("pickup");
  const [isSearching, setIsSearching] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Recent locations (mock data)
  const [recentLocations] = useState<LocationData[]>([
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
  ]);

  // Check location permission
  const checkLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setHasLocationPermission(status === "granted");
    return status === "granted";
  };

  // Get current location
  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      const granted = await checkLocationPermission();
      if (!granted) return null;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      // Get address from coordinates
      const placeInfo = await placesService.reverseGeocode({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });

      const currentLocation: LocationData = {
        address: placeInfo.formatted_address || "Current Location",
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city:
          placeInfo.address_components?.find((c) =>
            c.types.includes("locality")
          )?.long_name || "",
      };

      return currentLocation;
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  };

  // Search places with debounce
  const searchPlaces = useCallback(
    debounce(async (text: string) => {
      if (text.length < 2) {
        setPredictions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Search with current location as bias if available
        const location =
          pickup.latitude !== 0
            ? {
                lat: pickup.latitude,
                lng: pickup.longitude,
              }
            : undefined;

        const results = await placesService.autocomplete(text, location);
        setPredictions(results);
      } catch (error) {
        console.error("Error searching places:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [pickup]
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    searchPlaces(text);
  };

  const handleSelectPlace = async (prediction: PlaceAutocompletePrediction) => {
    try {
      setIsSearching(true);
      const placeDetails = await placesService.getPlaceDetails(
        prediction.place_id || ""
      );

      if (placeDetails && placeDetails.geometry) {
        const locationData: LocationData = {
          address: placeDetails.formatted_address || prediction.description,
          placeName: placeDetails.name,
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
          city:
            placeDetails.address_components?.find((c) =>
              c.types.includes("locality")
            )?.long_name || "",
        };

        if (searchLocationType === "pickup") {
          setPickup(locationData);
        } else {
          setDropoff(locationData);
        }

        setSearchQuery(locationData.placeName || locationData.address);
        setPredictions([]);

        return locationData;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    } finally {
      setIsSearching(false);
    }

    return null;
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPredictions([]);
  };

  const setCurrentLocationAsPickup = async () => {
    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setPickup(currentLocation);
      return currentLocation;
    }
    return null;
  };

  const handleSelectRecentLocation = (location: LocationData) => {
    if (searchLocationType === "pickup") {
      setPickup(location);
    } else {
      setDropoff(location);
    }
    setSearchQuery(location.address);
    setPredictions([]);
    return location;
  };

  return {
    pickup,
    setPickup,
    dropoff,
    setDropoff,
    searchQuery,
    setSearchQuery,
    predictions,
    setPredictions,
    searchLocationType,
    setSearchLocationType,
    isSearching,
    hasLocationPermission,
    recentLocations,
    checkLocationPermission,
    getCurrentLocation,
    handleSearchChange,
    handleSelectPlace,
    handleClearSearch,
    setCurrentLocationAsPickup,
    handleSelectRecentLocation,
  };
}
