// app/(main)/partner/trips/[id]/navigation.tsx
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  SafeAreaView,
  Platform,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  Layers,
  Phone,
  MessageCircle,
  ArrowLeft,
  Clock,
  CheckCircle,
} from "lucide-react-native";

export default function TripNavigationScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const [showDirections, setShowDirections] = useState(true);
  const [tripStage, setTripStage] = useState<"to_pickup" | "to_dropoff">(
    "to_pickup"
  );

  // Mock data - Replace with your trip data
  const tripData = {
    pickup: {
      name: "Marrakech Airport (RAK)",
      address: "Airport Road, Marrakech",
      coordinates: {
        latitude: 31.6025,
        longitude: -8.0255,
      },
    },
    dropoff: {
      name: "La Mamounia Hotel",
      address: "Avenue Bab Jdid, Marrakech",
      coordinates: {
        latitude: 31.6245,
        longitude: -7.9925,
      },
    },
    customer: {
      name: "John Doe",
      phone: "+212666778899",
    },
    estimatedDuration: "25 min",
    estimatedDistance: "8.5 km",
  };

  const handleStageComplete = () => {
    if (tripStage === "to_pickup") {
      setTripStage("to_dropoff");
    } else {
      // Handle trip completion
      router.push(`/(main)/partner/(tabs)/trips/${id}`);
    }
  };

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<ArrowLeft size={20} />}
        onPress={() => router.back()}
      />
      <View style={styles.tripStage}>
        <Typography variant="md" weight="semibold">
          {tripStage === "to_pickup" ? "To Pickup" : "To Destination"}
        </Typography>
      </View>
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<Layers size={20} />}
        onPress={() => {
          /* Toggle map type */
        }}
      />
    </View>
  );

  const renderDirectionsCard = () => (
    <Card style={styles.directionsCard}>
      <View style={styles.locationHeader}>
        <View style={styles.locationInfo}>
          <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
            {tripStage === "to_pickup"
              ? "Pickup Location"
              : "Drop-off Location"}
          </Typography>
          <Typography variant="lg" weight="semibold">
            {tripStage === "to_pickup"
              ? tripData.pickup.name
              : tripData.dropoff.name}
          </Typography>
          <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
            {tripStage === "to_pickup"
              ? tripData.pickup.address
              : tripData.dropoff.address}
          </Typography>
        </View>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Navigation size={18} />}
          onPress={() => setShowDirections(!showDirections)}
        />
      </View>

      <View style={styles.tripInfo}>
        <View style={styles.infoItem}>
          <Clock size={16} color={theme.colors.gray[500]} />
          <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
            {tripData.estimatedDuration}
          </Typography>
        </View>
        <View style={styles.infoItem}>
          <Navigation size={16} color={theme.colors.gray[500]} />
          <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
            {tripData.estimatedDistance}
          </Typography>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Phone size={18} />}
          style={styles.actionButton}
          onPress={() => {
            /* Handle call */
          }}
        />
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<MessageCircle size={18} />}
          style={styles.actionButton}
          onPress={() => {
            /* Handle message */
          }}
        />
        <Button
          leftIcon={<CheckCircle size={18} />}
          style={StyleSheet.flatten([styles.actionButton, styles.mainAction])}
          onPress={handleStageComplete}
          title={
            tripStage === "to_pickup" ? "Arrived at Pickup" : "Complete Trip"
          }
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: tripData.pickup.coordinates.latitude,
          longitude: tripData.pickup.coordinates.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        followsUserLocation
        mapType="standard" // Add this
        loadingIndicatorColor="#666666" // Add this
        loadingBackgroundColor="#eeeeee" // Add this
      >
        {/* Pickup Marker */}
        <Marker
          title="Pickup Location"
          description={tripData.pickup.name}
          coordinate={tripData.pickup.coordinates}
        />

        {/* Dropoff Marker */}
        <Marker
          coordinate={tripData.dropoff.coordinates}
          title="Dropoff Location"
          description={tripData.dropoff.name}
        />
      </MapView>

      <SafeAreaView style={styles.overlay}>
        {renderTopBar()}
        {showDirections && renderDirectionsCard()}
      </SafeAreaView>
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  map: {
    width,
    height,
    position: "absolute", // This is important
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 40 : 16,
  },
  tripStage: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  directionsCard: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  locationInfo: {
    flex: 1,
    marginRight: 16,
  },
  tripInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  mainAction: {
    flex: 2,
  },
  marker: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
});
