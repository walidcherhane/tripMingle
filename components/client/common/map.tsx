import config from "@/config";
import { useBooking } from "@/context/BookingContext";
import { useLocation } from "@/hooks/useLocation";
import { useMapInteractions } from "@/hooks/useMapInteractions";
import { colors } from "@/theme/colors";
import { calculateRegion } from "@/utils/maps";
import { Pin } from "lucide-react-native";
import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MarkerData = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
};

// Same custom map style
const CUSTOM_MAP_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];
const Map = ({ bottomPadding = 0 }: { bottomPadding?: number }) => {
  const { currentStep, bookingData } = useBooking();
  const { pickupLocation, dropoffLocation } = bookingData;
  const { mapRef, animateToLocation, fitToCoordinates } = useMapInteractions(
    {
      lat: pickupLocation?.latitude,
      lng: pickupLocation?.longitude,
    },
    {
      lat: dropoffLocation?.latitude,
      lng: dropoffLocation?.longitude,
    }
  );
  const mapInsets = useSafeAreaInsets(); // Get the safe area insets

  const originLatitude = pickupLocation?.latitude;
  const originLongitude = pickupLocation?.longitude;

  const destinationLatitude = dropoffLocation?.latitude;
  const destinationLongitude = dropoffLocation?.longitude;

  const region = calculateRegion({
    originLatitude,
    originLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  useEffect(() => {
    if (pickupLocation && !dropoffLocation) {
      console.log("animate to pickup location");
      animateToLocation({
        lat: pickupLocation.latitude,
        lng: pickupLocation.longitude,
      });
    } else if (pickupLocation && dropoffLocation) {
      console.log("animate to both locations");
      fitToCoordinates();
    }
  }, [pickupLocation, dropoffLocation]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_DEFAULT}
      showsUserLocation
      userInterfaceStyle="light"
      initialRegion={region}
      mapPadding={{
        ...mapInsets,
        bottom: bottomPadding,
      }}
      style={{
        flex: 1,
      }}
      showsMyLocationButton={false}
      customMapStyle={CUSTOM_MAP_STYLE}
    >
      {originLatitude && originLongitude && (
        <Marker
          pinColor={colors.primary.brand}
          coordinate={{
            latitude: originLatitude,
            longitude: originLongitude,
          }}
        />
      )}
      {destinationLatitude && destinationLongitude && (
        <Marker
          coordinate={{
            latitude: destinationLatitude,
            longitude: destinationLongitude,
          }}
        />
      )}
      <MapViewDirections
        origin={{
          latitude: originLatitude ?? 0,
          longitude: originLongitude ?? 0,
        }}
        destination={{
          latitude: destinationLatitude ?? 0,
          longitude: destinationLongitude ?? 0,
        }}
        apikey={config.GOOGLE_PLACES_API_KEY}
        strokeWidth={5}
        strokeColor="#00a8e8"
        // onReady={onRouteFetched}
      />
    </MapView>
  );
};

export default Map;
