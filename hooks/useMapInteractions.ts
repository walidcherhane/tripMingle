// hooks/useMapInteractions.ts
import { LatLng } from "@/types/place";
import { LocationObjectCoords } from "expo-location";
import { useRef, useEffect } from "react";
import MapView from "react-native-maps";

export const INITIAL_ZOOM = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export const FOCUSED_ZOOM = {
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

export function useMapInteractions(
  pickupCoords: LatLng | null,
  dropoffCoords: LatLng | null
) {
  const mapRef = useRef<MapView>(null);

  const animateToLocation = (location: LatLng) => {
    mapRef.current?.animateToRegion(
      {
        latitude: location.lat,
        longitude: location.lng,
        ...FOCUSED_ZOOM,
      },
      1000
    );
  };

  const fitToCoordinates = () => {
    if (pickupCoords && dropoffCoords) {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: pickupCoords.lat, longitude: pickupCoords.lng },
          { latitude: dropoffCoords.lat, longitude: dropoffCoords.lng },
        ],
        {
          edgePadding: {
            top: 0,
            right: 50,
            bottom: 70,
            left: 50,
          },
          animated: true,
        }
      );
    }
  };

  return {
    mapRef,
    animateToLocation,
    fitToCoordinates,
  };
}
