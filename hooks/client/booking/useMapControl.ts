import { useState, useRef, useEffect } from "react";
import MapView from "react-native-maps";
import { Dimensions } from "react-native";
import { LocationData } from "@/types/booking";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Custom map style
export const CUSTOM_MAP_STYLE = [
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

export function useMapControl() {
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 31.6295, // Default to Marrakech
    longitude: -7.9811,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const updateMapRegion = (latitude: number, longitude: number) => {
    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  const adjustMapToShowMarkers = (
    pickup: LocationData,
    dropoff: LocationData
  ) => {
    if (!mapRef.current) return;

    const markers = [];

    if (pickup.latitude !== 0 && pickup.longitude !== 0) {
      markers.push({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      });
    }

    if (dropoff.latitude !== 0 && dropoff.longitude !== 0) {
      markers.push({
        latitude: dropoff.latitude,
        longitude: dropoff.longitude,
      });
    }

    if (markers.length === 0) return;

    if (markers.length === 1) {
      setMapRegion({
        latitude: markers[0].latitude,
        longitude: markers[0].longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
      return;
    }

    // Fit map to show all markers
    mapRef.current.fitToCoordinates(markers, {
      edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
      animated: true,
    });
  };

  return {
    mapRef,
    mapRegion,
    setMapRegion,
    updateMapRegion,
    adjustMapToShowMarkers,
    CUSTOM_MAP_STYLE,
  };
}
