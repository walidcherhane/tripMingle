// components/client/active-drivers.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Star, Clock, Users } from "lucide-react-native";
import { Card } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import useStorageUrl from "@/hooks/useStorageUrl";
import { Id } from "@/convex/_generated/dataModel";

interface Driver {
  id: string;
  name: string;
  photo: string | { _id: string };
  vehicle: {
    model: string;
    type: string;
    image: string | { _id: string };
    capacity: number;
  };
  rating: number;
  distance: string;
  eta: string;
  priceRange: {
    min: number;
    max: number;
  };
  status: "available" | "finishing_soon";
}

// Helper component to render an image with storage ID
const StorageImage = ({
  storageId,
  style,
  fallbackUri = "https://placehold.co/600x400/png",
}: {
  storageId: string | { _id: string } | undefined;
  style: any;
  fallbackUri?: string;
}) => {
  // If it's already a string URL, use it directly
  if (typeof storageId === "string" && storageId.startsWith("http")) {
    return <Image source={{ uri: storageId }} style={style} />;
  }

  // Extract the ID if it's an object
  const id =
    typeof storageId === "object" && storageId?._id
      ? (storageId._id as Id<"_storage">)
      : (storageId as Id<"_storage">);

  const { url, loading } = useStorageUrl(id);

  if (loading) {
    return <View style={[style, styles.loadingContainer]} />;
  }

  return <Image source={{ uri: url || fallbackUri }} style={style} />;
};

export const ActiveDrivers = () => {
  const { getSpacing, colors } = useTheme();
  const [userLocation, setUserLocation] = useState({
    latitude: 31.6295, // Default to Marrakech coordinates
    longitude: -7.9811,
  });

  // Fetch available drivers using our new endpoint
  const availableDrivers = useQuery(api.drivers.getAvailableDrivers, {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    maxDistance: 10, // 10km radius
  });

  // Format the drivers data to match our component's expected format
  const formattedDrivers = availableDrivers
    ? availableDrivers
        .filter(
          (driver): driver is NonNullable<typeof driver> => driver !== null
        )
        .map((driver) => ({
          id: driver.id,
          name: driver.name,
          photo: driver.photo,
          vehicle: {
            model: driver.vehicle.model,
            type: driver.vehicle.type,
            image: driver.vehicle.image,
            capacity: driver.vehicle.capacity,
          },
          rating: driver.rating,
          distance: driver.distance,
          eta: driver.eta,
          priceRange: driver.priceRange,
          status: driver.status as "available" | "finishing_soon",
        }))
    : [];

  return (
    <View style={{ marginTop: getSpacing("lg") }}>
      <View style={[styles.header, { marginHorizontal: getSpacing("lg") }]}>
        <View>
          <Typography variant="lg" weight="bold" color="primary.dark">
            Available Drivers
          </Typography>
          <Typography variant="sm" color="gray.500">
            {formattedDrivers.length} drivers nearby
          </Typography>
        </View>
        <TouchableOpacity
          style={[
            styles.mapButton,
            {
              backgroundColor: colors.primary.brand + "10",
              padding: getSpacing("xs"),
              paddingInline: getSpacing("sm"),
              borderRadius: getSpacing("sm"),
            },
          ]}
        >
          <Typography variant="sm" weight="medium" color="primary.brand">
            Show Map
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {formattedDrivers.length > 0 ? (
          formattedDrivers.map((driver) => (
            <Card
              key={driver.id}
              style={[
                styles.driverCard,
                {
                  padding: getSpacing("md"),
                },
              ]}
            >
              <View style={styles.driverInfo}>
                <StorageImage
                  storageId={driver.photo}
                  style={styles.driverPhoto}
                />
                <View style={styles.driverDetails}>
                  <Typography numberOfLines={1} variant="md" weight="semibold">
                    {driver.name}
                  </Typography>
                  <View style={styles.rating}>
                    <Star
                      size={14}
                      color={colors.warning}
                      fill={colors.warning}
                    />
                    <Typography variant="sm" color="gray.600">
                      {driver.rating}
                    </Typography>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        driver.status === "available"
                          ? colors.success + "20"
                          : colors.warning + "20",
                      borderRadius: getSpacing("sm"),
                      padding: getSpacing("xs"),
                      paddingInline: getSpacing("sm"),
                    },
                  ]}
                >
                  <Typography
                    variant="xs"
                    color={
                      driver.status === "available" ? "success" : "warning"
                    }
                  >
                    {driver.status === "available"
                      ? "Available"
                      : "Finishing Soon"}
                  </Typography>
                </View>
              </View>

              <StorageImage
                storageId={driver.vehicle.image}
                style={styles.vehicleImage}
              />

              <View style={styles.vehicleInfo}>
                <View>
                  <Typography variant="sm" weight="semibold">
                    {driver.vehicle.model}
                  </Typography>
                  <Typography variant="xs" color="gray.500">
                    {driver.vehicle.type.charAt(0).toUpperCase() +
                      driver.vehicle.type.slice(1)}
                  </Typography>
                </View>
                <View style={styles.capacity}>
                  <Users size={14} color={colors.gray[500]} />
                  <Typography variant="sm" color="gray.500">
                    {driver.vehicle.capacity}
                  </Typography>
                </View>
              </View>

              <View style={styles.footer}>
                <View style={styles.etaInfo}>
                  <Clock size={14} color={colors.gray[500]} />
                  <Typography variant="sm" color="gray.500">
                    {driver.eta} away • {driver.distance}
                  </Typography>
                </View>
                <Typography
                  variant="sm"
                  weight="semibold"
                  color="primary.brand"
                >
                  {driver.priceRange.min}-{driver.priceRange.max} MAD
                </Typography>
              </View>
            </Card>
          ))
        ) : (
          <View style={styles.noDriversContainer}>
            <Typography variant="md" color="gray.500">
              No drivers available in your area
            </Typography>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mapButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  driverCard: {
    width: 300,
    gap: 12,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  driverDetails: {
    flex: 1,
    marginLeft: 12,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusBadge: {
    alignSelf: "flex-start",
  },
  vehicleImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  vehicleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  capacity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etaInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noDriversContainer: {
    width: 300,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#f0f0f0",
  },
});
