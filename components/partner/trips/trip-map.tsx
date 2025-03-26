// components/trips/TripMap.tsx
import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, {
  Marker,
  Polyline,
  MapViewProps,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { MapPin } from "lucide-react-native";
import MapViewDirections from "react-native-maps-directions";
import config from "@/config";

interface LatLng {
  lat: number;
  lng: number;
}

interface TripMapProps extends Partial<MapViewProps> {
  pickup: LatLng;
  dropoff: LatLng;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  routeCoordinates?: Array<{
    latitude: number;
    longitude: number;
  }>;
  onRegionChange?: (region: any) => void;
  expanded?: boolean;
}

export const TripMap = ({
  pickup,
  dropoff,
  currentLocation,
  routeCoordinates,
  onRegionChange,
  expanded = false,
  ...mapProps
}: TripMapProps) => {
  const theme = useTheme();
  const mapRef = useRef<MapView | null>(null);

  // Calculate the region to show all points
  const getInitialRegion = () => {
    const points = [
      pickup,
      dropoff,
      ...(currentLocation ? [currentLocation] : []),
    ];

    let minLat = Math.min(...points.map((p) => p.latitude));
    let maxLat = Math.max(...points.map((p) => p.latitude));
    let minLng = Math.min(...points.map((p) => p.longitude));
    let maxLng = Math.max(...points.map((p) => p.longitude));

    const padding = 0.1; // Padding around points
    const latDelta = maxLat - minLat + padding;
    const lngDelta = maxLng - minLng + padding;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.02),
      longitudeDelta: Math.max(lngDelta, 0.02),
    };
  };

  // Fit map to show all markers
  const fitToMarkers = () => {
    if (mapRef.current && pickup && dropoff) {
      const points = [
        {
          latitude: pickup.lat,
          longitude: pickup.lng,
        },
        {
          latitude: dropoff.lat,
          longitude: dropoff.lng,
        },
        ...(currentLocation ? [currentLocation] : []),
      ];

      mapRef.current.fitToCoordinates(points, {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  };

  useEffect(() => {
    // Fit to markers when component mounts or locations change
    fitToMarkers();
  }, [pickup, dropoff, currentLocation]);

  return (
    <View style={[styles.container, expanded && styles.expandedContainer]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        // initialRegion={getInitialRegion()}
        onRegionChange={onRegionChange}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        {...mapProps}
      >
        {pickup && (
            <Marker
              coordinate={{
                latitude: pickup.lat,
                longitude: pickup.lng,
              }}
              title="Pickup Location"
            />
          )}
          {dropoff && (
            <Marker
              coordinate={{
                latitude: dropoff.lat,
                longitude: dropoff.lng,
              }}
              title="Dropoff Location"
            />
          )}
          {pickup && dropoff && (
            <MapViewDirections
              origin={{
                latitude: pickup?.lat,
                longitude: pickup?.lng,
              }}
              destination={{
                latitude: dropoff?.lat,
                longitude: dropoff?.lng,
              }}
              strokeWidth={4}
              strokeColor={theme.colors.primary.brand}
              apikey={config.GOOGLE_PLACES_API_KEY}
            />
          )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1 ,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  expandedContainer: {
    height: Dimensions.get("window").height,
    position: "absolute",
    top: 0,
    left: 0,
    right: 999,
    zIndex: 1000,
  },
  map: {
    // flex: 1,

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: "absolute",
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  currentLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
