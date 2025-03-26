import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { TouchableOpacity } from "react-native";
import { Star, Users } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface VehicleData {
  _id: Id<"vehicles">;
  brand: string;
  model: string;
  capacity: number;
  baseFare: number;
  images: Id<"_storage">[];
  // Other fields from the schema
}

export const FeaturedVehicles = () => {
  const { getSpacing, colors } = useTheme();
  const vehicles = useQuery(api.vehicles.getFeaturedVehicles, { limit: 10 });
  const getStorageUrl = useMutation(api.storage.getUrl);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Load image URLs when vehicles data changes
  useEffect(() => {
    const loadImageUrls = async () => {
      if (!vehicles) return;

      const urls: Record<string, string> = {};

      for (const vehicle of vehicles) {
        if (vehicle.images && vehicle.images.length > 0) {
          try {
            const url = await getStorageUrl({ storageId: vehicle.images[0] });
            if (url) {
              urls[vehicle._id] = url;
            } else {
              urls[vehicle._id] = "https://placehold.co/600x400.png";
            }
          } catch (error) {
            console.error("Error getting image URL:", error);
            urls[vehicle._id] = "https://placehold.co/600x400.png";
          }
        } else {
          urls[vehicle._id] = "https://placehold.co/600x400.png";
        }
      }

      setImageUrls(urls);
    };

    loadImageUrls();
  }, [vehicles, getStorageUrl]);

  if (vehicles === undefined) {
    return (
      <View style={{ marginTop: getSpacing("xl"), alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary.brand} />
      </View>
    );
  }

  if (vehicles.length === 0) {
    return (
      <View style={{ marginTop: getSpacing("xl"), alignItems: "center" }}>
        <Typography variant="md" color="gray.500">
          No vehicles available
        </Typography>
      </View>
    );
  }

  return (
    <View style={{ marginTop: getSpacing("xl") }}>
      <View style={styles.header}>
        <Typography variant="lg" weight="bold" color="primary.dark">
          Featured Vehicles
        </Typography>
        <TouchableOpacity>
          <Typography variant="sm" weight="medium" color="primary.brand">
            View all
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {vehicles.map((vehicle) => (
          <TouchableOpacity key={vehicle._id}>
            <Card
              style={[
                styles.card,
                {
                  padding: getSpacing("md"),
                },
              ]}
            >
              <Image
                source={{
                  uri:
                    imageUrls[vehicle._id] ||
                    "https://placehold.co/600x400.png",
                }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={[styles.cardContent, { padding: getSpacing("md") }]}>
                <View style={styles.locationBadge}>
                  <Typography variant="xs" color="primary.brand">
                    {vehicle.category.charAt(0).toUpperCase() +
                      vehicle.category.slice(1)}
                  </Typography>
                </View>

                <Typography
                  variant="md"
                  weight="semibold"
                  style={{ marginTop: getSpacing("xs") }}
                >
                  {`${vehicle.brand} ${vehicle.model}`}
                </Typography>

                <View style={styles.cardFooter}>
                  {/* We don't have rating in the vehicle schema */}
                  <View style={styles.ratingContainer}>
                    <Star
                      size={14}
                      color={colors.warning}
                      fill={colors.warning}
                    />
                    <Typography
                      variant="sm"
                      color="gray.600"
                      style={{ marginLeft: 4 }}
                    >
                      {/* Default rating since we don't have it in the schema */}
                      4.5
                    </Typography>
                  </View>

                  <View style={styles.capacityContainer}>
                    <Users size={14} color={colors.gray[500]} />
                    <Typography
                      variant="sm"
                      color="gray.600"
                      style={{ marginLeft: 4 }}
                    >
                      {vehicle.capacity}
                    </Typography>
                  </View>

                  <View style={styles.pricingContainer}>
                    <Typography
                      variant="sm"
                      weight="semibold"
                      color="primary.brand"
                    >
                      {vehicle.baseFare} MAD
                      <Typography variant="xs" color="gray.400">
                        /day
                      </Typography>
                    </Typography>
                  </View>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    width: 280,
    marginRight: 12,
    marginLeft: 4,
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
  },
  cardContent: {
    backgroundColor: "white",
  },
  locationBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.primary.brand + "10",
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  capacityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pricingContainer: {
    marginLeft: "auto",
  },
});
