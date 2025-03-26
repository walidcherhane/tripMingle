// app/(main)/partner/vehicles.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car,
  AlertCircle,
  Plus,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react-native";
import { router, Stack } from "expo-router";
import Animated, {
  FadeInRight,
  FadeOutLeft,
  LinearTransition,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterButton from "@/components/ui/filter-button";
import Filters from "@/components/ui/filters";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useStorageUrl from "@/hooks/useStorageUrl";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  images: string[];
  status: "active" | "inactive" | "maintenance";
  documentsStatus: "valid" | "expiring" | "expired";
  lastTrip?: string;
  nextService?: string;
  stats: {
    trips: number;
    earnings: number;
    rating: number;
  };
}

type Filter = "All" | "Active" | "Maintenance";

// Define styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerContent: {
    paddingBottom: 16,
    marginTop: 16,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  premiumCard: {
    marginBottom: 8,
  },
  premiumContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  premiumIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumText: {
    flex: 1,
  },
  vehicleCard: {
    padding: 0,
    overflow: "hidden",
  },
  vehicleImageContainer: {
    width: "100%",
    height: 200,
    flexDirection: "row",
  },
  mainImageContainer: {
    flex: 2,
    height: "100%",
  },
  thumbnailsContainer: {
    flex: 1,
    flexDirection: "column",
    height: "100%",
  },
  thumbnailWrapper: {
    flex: 1,
    height: "33.33%",
  },
  moreImagesContainer: {
    flex: 1,
    height: "33.33%",
    position: "relative",
  },
  moreImagesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  vehicleContent: {
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  stat: {
    alignItems: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

// Add a FloatingActionButton component
const FloatingActionButton = () => {
  const theme = useTheme();

  return (
    <Pressable
      style={[styles.fab, { backgroundColor: theme.colors.primary.brand }]}
      onPress={() => router.push("/partner/vehicles/add")}
    >
      <Plus size={24} color="white" />
    </Pressable>
  );
};

// Create a component for vehicle image
const VehicleImage = ({ storageId }: { storageId: string | undefined }) => {
  const theme = useTheme();
  const { url, loading } = useStorageUrl(storageId);

  if (loading) {
    return (
      <View
        style={[
          styles.vehicleImage,
          {
            backgroundColor: theme.colors.gray[200],
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator color={theme.colors.primary.brand} />
      </View>
    );
  }

  if (!url) {
    return (
      <View
        style={[
          styles.vehicleImage,
          {
            backgroundColor: theme.colors.gray[200],
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Car size={40} color={theme.colors.gray[400]} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={styles.vehicleImage}
      resizeMode="cover"
    />
  );
};

// Create a component for vehicle image gallery preview
const VehicleImagePreview = ({ imageIds }: { imageIds: string[] }) => {
  const theme = useTheme();
  const safeImageIds = imageIds.filter((id) => id);

  if (safeImageIds.length === 0) {
    return (
      <View
        style={[
          styles.vehicleImageContainer,
          { backgroundColor: theme.colors.gray[200] },
        ]}
      >
        <Car size={40} color={theme.colors.gray[400]} />
      </View>
    );
  }

  // If there's only one image, show it full width
  if (safeImageIds.length === 1) {
    return (
      <View style={styles.vehicleImageContainer}>
        <VehicleImage storageId={safeImageIds[0]} />
      </View>
    );
  }

  // If there are multiple images, show the first one larger and others as thumbnails
  return (
    <View style={styles.vehicleImageContainer}>
      <View style={styles.mainImageContainer}>
        <VehicleImage storageId={safeImageIds[0]} />
      </View>

      <View style={styles.thumbnailsContainer}>
        {safeImageIds.slice(1, 3).map((id, index) => (
          <View key={index} style={styles.thumbnailWrapper}>
            <VehicleImage storageId={id} />
          </View>
        ))}

        {safeImageIds.length > 3 && (
          <View style={styles.moreImagesContainer}>
            <View
              style={[
                styles.moreImagesOverlay,
                { backgroundColor: theme.colors.gray[900] + "80" },
              ]}
            >
              <Typography
                variant="md"
                weight="semibold"
                style={{ color: "white" }}
              >
                +{safeImageIds.length - 3}
              </Typography>
            </View>
            <VehicleImage storageId={safeImageIds[3]} />
          </View>
        )}
      </View>
    </View>
  );
};

const VehicleManagement = () => {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "active" | "maintenance"
  >("all");

  // Get the current authenticated user
  const currentUser = useQuery(api.auth.getMe);

  // Fetch user's vehicles from Convex
  const userVehicles = useQuery(
    api.vehicles.getUserVehicles,
    currentUser?._id ? { ownerId: currentUser._id } : "skip"
  );

  // Transform Convex vehicles to match our Vehicle interface
  const vehicles: Vehicle[] =
    userVehicles?.map((vehicle) => ({
      id: vehicle._id.toString(),
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      images: vehicle.images || [],
      status: vehicle.status,
      documentsStatus: "valid", // This would need to come from documents table
      lastTrip: "2 hours ago", // This would need to come from trips table
      stats: {
        trips: 0, // These would need to come from analytics or trips table
        earnings: 0,
        rating: 0,
      },
    })) || [];

  const filteredVehicles = vehicles.filter((vehicle) => {
    if (selectedFilter === "all") return true;
    return vehicle.status === selectedFilter;
  });

  const getStatusIcon = (status: Vehicle["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle size={20} color={theme.colors.success} />;
      case "inactive":
        return <AlertCircle size={20} color={theme.colors.gray[500]} />;
      case "maintenance":
        return <AlertTriangle size={20} color={theme.colors.warning} />;
    }
  };

  const StatusBadge = ({
    status,
    documentsStatus,
  }: Pick<Vehicle, "status" | "documentsStatus">) => (
    <View
      style={[styles.statusBadge, { backgroundColor: theme.colors.gray[50] }]}
    >
      {getStatusIcon(status)}
      <Typography
        variant="sm"
        weight="medium"
        style={{
          color: theme.colors.text,
          marginLeft: theme.getSpacing("xs"),
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Typography>
    </View>
  );
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{
          title: "Your Vehicles",
          headerShadowVisible: false,
        }}
      />
      {/* Header */}
      <View style={styles.headerContent}>
        <Filters
          filters={[
            { label: "All", value: "all" },
            { label: "Active", value: "active" },
            { label: "Maintenance", value: "maintenance" },
          ]}
          onSelectFilter={setSelectedFilter}
          selectedFilter={selectedFilter}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
        }
      >
        <View style={styles.content}>
          {/* Premium Card */}
          <Card style={styles.premiumCard}>
            <View style={styles.premiumContent}>
              <View style={styles.premiumIcon}>
                <Plus size={24} color={theme.colors.primary.brand} />
              </View>
              <View style={styles.premiumText}>
                <Typography
                  variant="lg"
                  weight="semibold"
                  style={{ color: theme.colors.text }}
                >
                  Add More Vehicles
                </Typography>
                <Typography
                  variant="sm"
                  style={{
                    color: theme.colors.gray[500],
                    marginTop: 4,
                  }}
                >
                  Unlock unlimited vehicles with our Premium plan
                </Typography>
              </View>
              <Button
                variant="primary"
                size="sm"
                title="Upgrade"
                onPress={() => {
                  /* Handle upgrade */
                }}
              />
            </View>
          </Card>

          {/* Vehicle Cards */}
          {filteredVehicles.map((vehicle) => (
            <Animated.View
              key={vehicle.id}
              entering={FadeInRight}
              exiting={FadeOutLeft}
              layout={LinearTransition}
            >
              <Card
                variant="default"
                style={styles.vehicleCard}
                onPress={() =>
                  router.push(`/partner/vehicles/details/${vehicle.id}`)
                }
              >
                <VehicleImagePreview imageIds={vehicle.images} />

                <View style={styles.vehicleContent}>
                  <View style={styles.vehicleHeader}>
                    <Typography
                      variant="lg"
                      weight="semibold"
                      style={{ color: theme.colors.text }}
                    >
                      {vehicle.brand} {vehicle.model}
                    </Typography>
                    <StatusBadge
                      status={vehicle.status}
                      documentsStatus={vehicle.documentsStatus}
                    />
                  </View>

                  <Typography
                    variant="sm"
                    style={{
                      color: theme.colors.gray[500],
                      marginTop: 4,
                    }}
                  >
                    {vehicle.licensePlate} • {vehicle.year}
                  </Typography>

                  {/* Quick Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                      <Typography
                        variant="sm"
                        style={{ color: theme.colors.gray[500] }}
                      >
                        Trips
                      </Typography>
                      <Typography
                        variant="md"
                        weight="semibold"
                        style={{ color: theme.colors.text }}
                      >
                        {vehicle.stats.trips}
                      </Typography>
                    </View>
                    <View style={styles.stat}>
                      <Typography
                        variant="sm"
                        style={{ color: theme.colors.gray[500] }}
                      >
                        Rating
                      </Typography>
                      <Typography
                        variant="md"
                        weight="semibold"
                        style={{ color: theme.colors.text }}
                      >
                        {vehicle.stats.rating}
                      </Typography>
                    </View>
                    <View style={styles.stat}>
                      <Typography
                        variant="sm"
                        style={{ color: theme.colors.gray[500] }}
                      >
                        Earnings
                      </Typography>
                      <Typography
                        variant="md"
                        weight="semibold"
                        style={{ color: theme.colors.text }}
                      >
                        {vehicle.stats.earnings.toLocaleString()} MAD
                      </Typography>
                    </View>
                  </View>

                  {/* Status Info */}
                  <View style={styles.statusInfo}>
                    <Clock size={16} color={theme.colors.gray[400]} />
                    <Typography
                      variant="sm"
                      style={{
                        color: theme.colors.gray[500],
                        marginLeft: 4,
                      }}
                    >
                      {vehicle.lastTrip
                        ? `Last trip: ${vehicle.lastTrip}`
                        : `Next service: ${vehicle.nextService}`}
                    </Typography>
                  </View>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Add Floating Action Button */}
      <FloatingActionButton />
    </View>
  );
};

export default VehicleManagement;
