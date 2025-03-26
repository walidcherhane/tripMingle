import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { MapPin, Navigation } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { LocationData } from "@/types/booking";
import config from "@/config";

interface BookingMapProps {
  mapRef: React.RefObject<MapView>;
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  customMapStyle: any[];
  pickup: LocationData;
  dropoff: LocationData;
  hasLocationPermission: boolean;
}

export function BookingMap({
  mapRef,
  mapRegion,
  customMapStyle,
  pickup,
  dropoff,
  hasLocationPermission,
}: BookingMapProps) {
  const theme = useTheme();

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      provider={PROVIDER_DEFAULT}
      initialRegion={mapRegion}
      region={mapRegion}
      customMapStyle={customMapStyle}
      showsUserLocation={hasLocationPermission}
      showsMyLocationButton={false}
    >
      {pickup.latitude !== 0 && pickup.longitude !== 0 && (
        <Marker
          coordinate={{
            latitude: pickup.latitude,
            longitude: pickup.longitude,
          }}
          title="Pickup"
          description={pickup.address}
        >
          <View style={styles.markerContainer}>
            <MapPin size={24} color={theme.getColor("primary.brand")} />
          </View>
        </Marker>
      )}

      {dropoff.latitude !== 0 && dropoff.longitude !== 0 && (
        <Marker
          coordinate={{
            latitude: dropoff.latitude,
            longitude: dropoff.longitude,
          }}
          title="Destination"
          description={dropoff.address}
        >
          <View style={styles.markerContainer}>
            <Navigation size={24} color={theme.getColor("error")} />
          </View>
        </Marker>
      )}

      {pickup.latitude !== 0 &&
        pickup.longitude !== 0 &&
        dropoff.latitude !== 0 &&
        dropoff.longitude !== 0 && (
          <MapViewDirections
            apikey={config.GOOGLE_PLACES_API_KEY}
            origin={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            destination={{
              latitude: dropoff.latitude,
              longitude: dropoff.longitude,
            }}
            strokeWidth={3}
            strokeColor={theme.getColor("primary.brand")}
          />
        )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
  },
});
