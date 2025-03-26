// app/(main)/partner/vehicles/index.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VehicleMetrics } from "@/components/partner/vehicle/vehicle-metrics";
import { VehicleStatusControl } from "@/components/partner/vehicle/vehicle-status-control";
import {
  AlertTriangle,
  Shield,
  Car,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react-native";
import { colors } from "@/theme/colors";
import { VehicleDocuments } from "@/components/partner/vehicle/vehicle-documents";
import { VehicleAnalytics } from "@/components/partner/vehicle/vehicle-analytics";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import useStorageUrl from "@/hooks/useStorageUrl";
import VehicleImageGallery from "@/components/partner/vehicle/vehicle-image-gallery";

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  images: string[];
  status: "active" | "inactive" | "maintenance";
  metrics: {
    completedTrips: number;
    totalEarnings: number;
    averageRating: number;
    cancellationRate: number;
  };
  documentsStatus: {
    carteGrise: {
      status: "valid" | "expiring" | "expired";
      expiryDate: string;
    };
    insurance: { status: "valid" | "expiring" | "expired"; expiryDate: string };
    technicalVisit: {
      status: "valid" | "expiring" | "expired";
      expiryDate: string;
    };
  };
  nextMaintenance?: string;
  lastTrip?: string;
}

export default function VehicleManagementScreen() {
  const params = useLocalSearchParams();
  const vehicleId = params.id as string;
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Get the current authenticated user
  const currentUser = useQuery(api.auth.getMe);

  // Fetch vehicle details from Convex
  const convexVehicle = useQuery(
    api.vehicles.getVehicle,
    vehicleId ? { vehicleId: vehicleId as Id<"vehicles"> } : "skip"
  );

  // Fetch vehicle documents from Convex
  const vehicleDocuments = useQuery(
    api.vehicles.getVehicleDocuments,
    vehicleId ? { vehicleId: vehicleId as Id<"vehicles"> } : "skip"
  );

  // Transform Convex vehicle to match our Vehicle interface
  const vehicle: Vehicle | null = convexVehicle
    ? {
        id: convexVehicle._id.toString(),
        brand: convexVehicle.brand,
        model: convexVehicle.model,
        year: convexVehicle.year,
        licensePlate: convexVehicle.licensePlate,
        images: convexVehicle.images || [],
        status: convexVehicle.status as "active" | "inactive" | "maintenance",
        metrics: {
          completedTrips: 0, // These would come from analytics
          totalEarnings: 0,
          averageRating: 0,
          cancellationRate: 0,
        },
        documentsStatus: {
          carteGrise: { status: "valid", expiryDate: "2024-12-31" },
          insurance: { status: "valid", expiryDate: "2024-12-31" },
          technicalVisit: { status: "valid", expiryDate: "2024-12-31" },
        },
        lastTrip: "No trips yet",
      }
    : null;

  // Update vehicle status mutation
  const updateVehicleStatus = useMutation(api.vehicles.updateVehicle);

  const getStatusColor = (status: "valid" | "expiring" | "expired") => {
    switch (status) {
      case "valid":
        return theme.colors.success;
      case "expiring":
        return theme.colors.warning;
      case "expired":
        return theme.colors.error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Wait a bit to simulate refresh
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (vehicleId) {
      try {
        await updateVehicleStatus({
          vehicleId: vehicleId as Id<"vehicles">,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update vehicle status:", error);
      }
    }
  };

  if (!vehicle) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Typography variant="lg">Loading vehicle details...</Typography>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${vehicle.brand} ${vehicle.model}`,
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View key={vehicle.id} style={styles.vehicleSection}>
          {/* Vehicle Header Card */}
          <View style={styles.headerCard}>
            <VehicleImageGallery imageIds={vehicle.images} />

            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <Typography variant="xl" weight="bold">
                  {vehicle.brand} {vehicle.model}
                </Typography>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Car size={16} color={theme.colors.gray[500]} />
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    {vehicle.licensePlate} • {vehicle.year}
                  </Typography>
                </View>
                {vehicle.lastTrip && (
                  <View style={styles.infoItem}>
                    <Clock size={16} color={theme.colors.gray[500]} />
                    <Typography
                      variant="sm"
                      style={{ color: theme.colors.gray[500] }}
                    >
                      Last trip: {vehicle.lastTrip}
                    </Typography>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.vehicleDetails}>
            {/* Status Control */}
            <VehicleStatusControl
              currentStatus={vehicle.status}
              onStatusChange={handleStatusChange}
            />

            {/* Quick Metrics */}
            <VehicleMetrics metrics={vehicle.metrics} />

            {/* Vehicle Analytics */}
            <VehicleAnalytics
              onPeriodChange={(period) =>
                console.log("Period changed:", period)
              }
              selectedPeriod="day"
              data={{
                earnings: {
                  daily: [
                    { date: "2023-10-01", amount: 120 },
                    { date: "2023-10-02", amount: 150 },
                    { date: "2023-10-03", amount: 100 },
                  ],
                  total: 370,
                  trend: 5.2,
                },
                trips: {
                  total: 200,
                  completed: 180,
                  cancelled: 20,
                  popularRoutes: [
                    { from: "Location A", to: "Location B", count: 50 },
                    { from: "Location C", to: "Location D", count: 30 },
                  ],
                  timeDistribution: [
                    { hour: "08:00", trips: 20 },
                    { hour: "12:00", trips: 30 },
                    { hour: "18:00", trips: 50 },
                  ],
                },
                customers: {
                  total: 150,
                  returning: 100,
                  newThisMonth: 20,
                  satisfaction: 4.5,
                },
              }}
            />

            {/* Vehicle Documents */}
            <VehicleDocuments
              documents={vehicleDocuments ?? []}
              onUpdateDocument={() => {}}
              onViewDocument={() => {}}
            />

            {/* Maintenance Alert if needed */}
            {vehicle.nextMaintenance && (
              <Card style={{ ...styles.card, ...styles.maintenanceCard }}>
                <View style={styles.maintenanceContent}>
                  <AlertTriangle size={20} color={theme.colors.warning} />
                  <View style={styles.maintenanceText}>
                    <Typography variant="md" weight="semibold">
                      Maintenance Due
                    </Typography>
                    <Typography
                      variant="sm"
                      style={{ color: theme.colors.gray[500] }}
                    >
                      Scheduled for {vehicle.nextMaintenance}
                    </Typography>
                  </View>
                  <Button
                    size="sm"
                    variant="secondary"
                    title="View"
                    onPress={() => {
                      /* Handle maintenance view */
                    }}
                  />
                </View>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  vehicleDetails: {
    padding: 16,
  },
  vehicleSection: {
    gap: 16,
  },
  headerCard: {
    padding: 0,
    overflow: "hidden",
  },
  vehicleImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  headerContent: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  documentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  manageButton: {
    marginTop: 16,
  },
  maintenanceCard: {
    backgroundColor: "#FFFBEB",
    borderColor: colors.warning,
    borderWidth: 1,
  },
  maintenanceContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  maintenanceText: {
    flex: 1,
  },
});
