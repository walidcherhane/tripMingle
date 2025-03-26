import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  User,
  Phone,
  Clock,
  Calendar,
  DollarSign,
  MessageCircle,
  Navigation,
  AlertCircle,
  Minimize2,
  Maximize2,
  CheckCircle2,
} from "lucide-react-native";
import { formatDateTime, formatTime, formatDuration } from "@/utils/date";
import { TripStatusBadge } from "@/components/partner/trips/trip-status-badge";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { Toast } from "@/components/ui/toast";

// Define the valid status types to match Convex schema
type TripStatusType =
  | "searching"
  | "driverMatched"
  | "driverApproaching"
  | "driverArrived"
  | "inProgress"
  | "completed"
  | "cancelled";

export default function TripScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch trip data
  const tripData = useQuery(api.trips.getTrip, {
    tripId: id as Id<"trips">,
  });

  // Status update mutation
  const updateTripStatus = useMutation(api.trips.updateTripStatus);

  if (!tripData) {
    return (
      <View style={styles.container}>
        <Typography variant="md" weight="semibold">
          Trip not found
        </Typography>
      </View>
    );
  }

  // Actions
  const handleStartNavigation = () => {
    // Open the navigation app with coordinates
    const { latitude, longitude } = tripData.pickupLocation;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    // In a real app, you would open this URL using Linking
    Alert.alert(
      "Navigation",
      `Starting navigation to ${tripData.pickupLocation.address}`
    );
  };

  const handleCallCustomer = () => {
    // In a real app, this would trigger a phone call
    Alert.alert("Call Customer", "This would start a call to the customer");
  };

  const handleMessageCustomer = () => {
    // Navigate to messaging screen using string id
    const messageRoute =
      `/(main)/partner/(tabs)/messages/${String(tripData._id)}` as any;
    router.push(messageRoute);
  };

  const handleCancelTrip = () => {
    Alert.alert("Cancel Trip", "Are you sure you want to cancel this trip?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => {
          // Show another dialog for reason
          Alert.prompt(
            "Cancellation Reason",
            "Please provide a reason for cancellation:",
            async (reason) => {
              if (!reason) {
                Alert.alert(
                  "Error",
                  "A reason is required to cancel the trip."
                );
                return;
              }

              setLoading(true);
              try {
                // Update trip status to cancelled
                await updateTripStatus({
                  tripId: tripData._id,
                  status: "cancelled",
                });

                // In a real app, we would also store the cancellation reason separately
                Alert.alert("Success", "Trip has been cancelled.");
                router.back();
              } catch (error) {
                console.error(error);
                Alert.alert(
                  "Error",
                  "Failed to cancel trip. Please try again."
                );
              } finally {
                setLoading(false);
              }
            }
          );
        },
      },
    ]);
  };

  // Update trip status functions
  const updateStatus = async (newStatus: TripStatusType) => {
    setLoading(true);
    try {
      await updateTripStatus({
        tripId: tripData._id,
        status: newStatus,
      });
      Alert.alert("Success", `Trip status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update trip status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get available actions based on current status
  const getStatusActions = () => {
    switch (tripData.status) {
      case "driverMatched":
        return (
          <View style={styles.actionButtons}>
            <Button
              title="Start Navigation"
              leftIcon={<Navigation size={20} />}
              onPress={handleStartNavigation}
              style={styles.actionButton}
            />
            <Button
              title="Approaching"
              leftIcon={<MapPin size={20} />}
              onPress={() => updateStatus("driverApproaching")}
              style={styles.actionButton}
            />
          </View>
        );
      case "driverApproaching":
        return (
          <View style={styles.actionButtons}>
            <Button
              title="Start Navigation"
              leftIcon={<Navigation size={20} />}
              onPress={handleStartNavigation}
              style={styles.actionButton}
            />
            <Button
              title="I've Arrived"
              leftIcon={<CheckCircle2 size={20} />}
              onPress={() => updateStatus("driverArrived")}
              style={styles.actionButton}
            />
          </View>
        );
      case "driverArrived":
        return (
          <View style={styles.actionButtons}>
            <Button
              title="Start Trip"
              leftIcon={<CheckCircle2 size={20} />}
              onPress={() => updateStatus("inProgress")}
              style={styles.actionButton}
            />
          </View>
        );
      case "inProgress":
        return (
          <View style={styles.actionButtons}>
            <Button
              title="End Trip"
              onPress={() => updateStatus("completed")}
              style={styles.actionButton}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Trip Details",
          headerRight: () => (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<AlertCircle size={18} />}
              title=""
              onPress={() => {
                /* Handle issue report */
                Alert.alert(
                  "Report Issue",
                  "This would open an issue reporting form"
                );
              }}
            />
          ),
        }}
      />

      {loading ? (
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={theme.colors.primary.brand} />
          <Typography variant="md" style={{ marginTop: 20 }}>
            Updating trip...
          </Typography>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          {/* Status & Time */}
          <Card style={styles.section}>
            <View style={styles.statusHeader}>
              <TripStatusBadge status={tripData.status} />
              <Typography
                variant="sm"
                style={{ color: theme.colors.gray[500] }}
              >
                {tripData.timing && tripData.timing.departureTime
                  ? tripData.timing.departureTime
                  : formatDateTime(new Date(tripData.createdAt).toISOString())}
              </Typography>
            </View>

            {/* Route Information */}
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <MapPin size={20} color={theme.colors.success} />
                <View style={styles.locationInfo}>
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    Pickup
                  </Typography>
                  <Typography variant="md" weight="medium">
                    {tripData.pickupLocation.placeName || "Pickup Location"}
                  </Typography>
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    {tripData.pickupLocation.address}
                  </Typography>
                </View>
              </View>

              <View style={styles.routeDivider} />

              <View style={styles.routePoint}>
                <MapPin size={20} color={theme.colors.error} />
                <View style={styles.locationInfo}>
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    Drop-off
                  </Typography>
                  <Typography variant="md" weight="medium">
                    {tripData.dropoffLocation.placeName || "Dropoff Location"}
                  </Typography>
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    {tripData.dropoffLocation.address}
                  </Typography>
                </View>
              </View>
            </View>

            {/* Status Actions */}
            {getStatusActions()}
          </Card>

          {/* Trip Information */}
          <Card style={styles.section}>
            <Typography
              variant="lg"
              weight="semibold"
              style={styles.sectionTitle}
            >
              Trip Information
            </Typography>

            <View style={styles.tripInfo}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Clock size={20} color={theme.colors.gray[500]} />
                  <View>
                    <Typography
                      variant="sm"
                      style={{ color: theme.colors.gray[500] }}
                    >
                      Duration
                    </Typography>
                    <Typography variant="md" weight="medium">
                      {tripData.estimatedDuration
                        ? `${tripData.estimatedDuration} min`
                        : "Not available"}
                    </Typography>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Navigation size={20} color={theme.colors.gray[500]} />
                  <View>
                    <Typography
                      variant="sm"
                      style={{ color: theme.colors.gray[500] }}
                    >
                      Distance
                    </Typography>
                    <Typography variant="md" weight="medium">
                      {tripData.estimatedDistance
                        ? `${tripData.estimatedDistance} km`
                        : "Not available"}
                    </Typography>
                  </View>
                </View>
              </View>

              {tripData.timing && tripData.timing.departureTime && (
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Calendar size={20} color={theme.colors.gray[500]} />
                    <View>
                      <Typography
                        variant="sm"
                        style={{ color: theme.colors.gray[500] }}
                      >
                        Scheduled
                      </Typography>
                      <Typography variant="md" weight="medium">
                        {tripData.timing.departureTime}
                      </Typography>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Card>

          {/* Customer Info - Would need to fetch user details in real app */}
          <Card style={styles.section}>
            <Typography
              variant="lg"
              weight="semibold"
              style={styles.sectionTitle}
            >
              Customer
            </Typography>

            <View style={styles.customerInfo}>
              <View style={styles.customerHeader}>
                <View style={styles.customerBasic}>
                  <User size={20} color={theme.colors.gray[500]} />
                  <View style={styles.customerDetails}>
                    <Typography variant="md" weight="medium">
                      Client
                    </Typography>
                  </View>
                </View>
                <View style={styles.customerActions}>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<Phone size={18} />}
                    onPress={handleCallCustomer}
                    title=""
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<MessageCircle size={18} />}
                    onPress={handleMessageCustomer}
                    title=""
                  />
                </View>
              </View>

              {tripData.tripDetails && tripData.tripDetails.specialRequests && (
                <View style={styles.notes}>
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    Special Requests:
                  </Typography>
                  <Typography variant="sm">
                    {tripData.tripDetails.specialRequests}
                  </Typography>
                </View>
              )}
            </View>
          </Card>

          {/* Price Information */}
          {tripData.pricing && (
            <Card style={styles.section}>
              <View style={styles.priceHeaderContainer}>
                <Typography
                  variant="lg"
                  weight="semibold"
                  style={styles.sectionTitle}
                >
                  Payment
                </Typography>
                <Pressable
                  onPress={() => setShowPriceBreakdown(!showPriceBreakdown)}
                >
                  {showPriceBreakdown ? (
                    <Minimize2 size={20} color={theme.colors.primary.brand} />
                  ) : (
                    <Maximize2 size={20} color={theme.colors.primary.brand} />
                  )}
                </Pressable>
              </View>

              <View style={styles.priceInfo}>
                <View style={styles.priceHeader}>
                  <View style={styles.priceMethod}>
                    <DollarSign size={20} color={theme.colors.gray[500]} />
                    <Typography
                      variant="md"
                      weight="medium"
                      style={{ marginLeft: 4 }}
                    >
                      {tripData.paymentMethod || "Cash"}
                    </Typography>
                  </View>
                  <Typography variant="lg" weight="bold">
                    {tripData.pricing.total} {tripData.pricing.currency}
                  </Typography>
                </View>

                {showPriceBreakdown && (
                  <View style={styles.priceBreakdown}>
                    <View style={styles.priceRow}>
                      <Typography variant="sm">Base fare</Typography>
                      <Typography variant="sm">
                        {tripData.pricing.baseFare} {tripData.pricing.currency}
                      </Typography>
                    </View>
                    <View style={styles.priceRow}>
                      <Typography variant="sm">Distance fare</Typography>
                      <Typography variant="sm">
                        {tripData.pricing.distanceFare}{" "}
                        {tripData.pricing.currency}
                      </Typography>
                    </View>
                    <View style={styles.priceRow}>
                      <Typography variant="sm">Taxes</Typography>
                      <Typography variant="sm">
                        {tripData.pricing.taxes} {tripData.pricing.currency}
                      </Typography>
                    </View>
                    <View style={[styles.priceRow, styles.priceTotalRow]}>
                      <Typography variant="md" weight="semibold">
                        Total
                      </Typography>
                      <Typography variant="md" weight="semibold">
                        {tripData.pricing.total} {tripData.pricing.currency}
                      </Typography>
                    </View>
                  </View>
                )}
              </View>
            </Card>
          )}

          {/* Actions */}
          {tripData.status !== "completed" &&
            tripData.status !== "cancelled" && (
              <Card style={[styles.section, styles.actionsSection]}>
                <Button
                  title="Cancel Trip"
                  variant="primary"
                  onPress={handleCancelTrip}
                  style={styles.cancelButton}
                  textStyle={{ color: "white" }}
                />
              </Card>
            )}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  routeContainer: {
    gap: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  locationInfo: {
    flex: 1,
    gap: 4,
  },
  routeDivider: {
    width: 2,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginLeft: 9,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  tripInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  customerInfo: {
    gap: 16,
  },
  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerBasic: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  customerDetails: {
    gap: 4,
  },
  customerActions: {
    flexDirection: "row",
    gap: 8,
  },
  notes: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  priceHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceInfo: {
    gap: 16,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceBreakdown: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceTotalRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
  },
  actionsSection: {
    marginBottom: 32,
  },
  cancelButton: {
    marginTop: 0,
  },
});
