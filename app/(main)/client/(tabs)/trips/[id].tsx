import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { formatDate, formatTime, formatDateTime } from "@/utils/dateUtils";
import { Id } from "@/convex/_generated/dataModel";
import { Typography } from "@/components/ui/typography";

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to format trip status
  function formatTripStatus(status: string) {
    switch (status) {
      case "searching":
        return "Finding Driver";
      case "driverMatched":
        return "Driver Matched";
      case "driverApproaching":
        return "Driver On Way";
      case "driverArrived":
        return "Driver Arrived";
      case "inProgress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  // Fetch trip details from Convex
  const trip = useQuery(api.trips.getTrip, {
    tripId: id as unknown as Id<"trips">,
  });

  // Mutations
  const cancelTrip = useMutation(api.trips.cancelTrip);

  // Fetch driver details - Always call the hook, but with a conditional parameter
  const driverQuery = useQuery(
    api.auth.getUserById,
    trip?.partnerId ? { userId: trip.partnerId } : "skip"
  );

  // Fetch vehicle details - Always call the hook, but with a conditional parameter
  const vehicleQuery = useQuery(
    api.vehicles.getVehicle,
    trip?.vehicleId ? { vehicleId: trip.vehicleId } : "skip"
  );

  // Now safely use the results
  const driver = driverQuery;
  const vehicle = vehicleQuery;

  const handleCancelTrip = async () => {
    if (!cancellationReason.trim()) {
      Alert.alert("Error", "Please provide a reason for cancellation");
      return;
    }

    setIsSubmitting(true);
    try {
      await cancelTrip({
        tripId: id as unknown as Id<"trips">,
        cancellationReason: cancellationReason,
        cancelledBy: "client",
      });
      setCancelModalVisible(false);
      Alert.alert("Success", "Trip cancelled successfully");
      // Navigate to the trips tab screen
      router.replace("/(main)/client/(tabs)/trips");
    } catch (error) {
      console.error("Error cancelling trip:", error);
      Alert.alert("Error", "Failed to cancel trip. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!trip) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  // Check if the trip is in a state where cancellation is allowed
  const isCancellable = [
    "searching",
    "driverMatched",
    "driverApproaching",
  ].includes(trip.status);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isCancellable ? 80 + bottom : 32 },
        ]}
      >
        {/* Trip Status */}
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusBadge, getStatusStyle(trip.status).container]}
          >
            <Typography
              style={[styles.statusText, getStatusStyle(trip.status).text]}
            >
              {formatTripStatus(trip.status)}
            </Typography>
          </View>

          <Typography style={styles.dateText}>
            {trip.timing.isScheduled && trip.timing.departureDate
              ? formatDateTime(new Date(trip.timing.departureDate))
              : formatDateTime(new Date(trip.createdAt))}
          </Typography>
        </View>

        {/* Trip Route */}
        <View style={styles.routeCard}>
          <Typography style={styles.sectionTitle}>Trip Route</Typography>

          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <View style={styles.locationDot} />
              <View style={styles.locationTextContainer}>
                <Typography style={styles.locationLabel}>Pickup</Typography>
                <Typography style={styles.locationText}>
                  {trip.pickupLocation.address}
                </Typography>
              </View>
            </View>

            <View style={styles.locationLine} />

            <View style={styles.locationRow}>
              <View style={[styles.locationDot, styles.destinationDot]} />
              <View style={styles.locationTextContainer}>
                <Typography style={styles.locationLabel}>Dropoff</Typography>
                <Typography style={styles.locationText}>
                  {trip.dropoffLocation.address}
                </Typography>
              </View>
            </View>
          </View>

          {trip.estimatedDistance && trip.estimatedDuration && (
            <View style={styles.estimateRow}>
              <View style={styles.estimateItem}>
                <Ionicons name="speedometer-outline" size={18} color="#666" />
                <Typography style={styles.estimateText}>
                  {trip.estimatedDistance.toFixed(1)} km
                </Typography>
              </View>
              <View style={styles.estimateItem}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Typography style={styles.estimateText}>
                  {trip.estimatedDuration} min
                </Typography>
              </View>
            </View>
          )}
        </View>

        {/* Trip Details */}
        <View style={styles.detailsCard}>
          <Typography variant="2xl" style={styles.sectionTitle}>
            Trip Details
          </Typography>

          <View style={styles.detailRow}>
            <Typography style={styles.detailLabel}>Passengers</Typography>
            <Typography style={styles.detailValue}>
              {trip.tripDetails.passengers}
            </Typography>
          </View>

          <View style={styles.detailRow}>
            <Typography style={styles.detailLabel}>Luggage</Typography>
            <Typography style={styles.detailValue}>
              {trip.tripDetails.luggage}
            </Typography>
          </View>

          {trip.tripDetails.specialRequests && (
            <View style={styles.detailRow}>
              <Typography style={styles.detailLabel}>
                Special Requests
              </Typography>
              <Typography style={styles.detailValue}>
                {trip.tripDetails.specialRequests}
              </Typography>
            </View>
          )}

          {trip.timing.isScheduled && (
            <View style={styles.detailRow}>
              <Typography style={styles.detailLabel}>Scheduled</Typography>
              <Typography style={styles.detailValue}>
                {trip.timing.departureDate &&
                  formatDate(new Date(trip.timing.departureDate))}{" "}
                {trip.timing.departureTime &&
                  formatTime(new Date(trip.timing.departureTime))}
              </Typography>
            </View>
          )}
        </View>

        {/* Driver & Vehicle (if available) */}
        {driver && vehicle && (
          <View style={styles.driverCard}>
            <Typography style={styles.sectionTitle}>
              Driver & Vehicle
            </Typography>

            <View style={styles.driverInfo}>
              {driver.profileImage ? (
                <Image
                  source={{ uri: driver.profileImage }}
                  style={styles.driverImage}
                />
              ) : (
                <View style={styles.driverImagePlaceholder}>
                  <Ionicons name="person" size={30} color="#ccc" />
                </View>
              )}

              <View style={styles.driverDetails}>
                <Typography style={styles.driverName}>
                  {driver.firstName} {driver.lastName}
                </Typography>
                {driver.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Typography style={styles.ratingText}>
                      {driver.rating.toFixed(1)}
                    </Typography>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleDetails}>
                <Typography style={styles.vehicleName}>
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </Typography>
                <Typography style={styles.vehicleDescription}>
                  {vehicle.color} • {vehicle.licensePlate}
                </Typography>
              </View>
              {vehicle.images && vehicle.images.length > 0 && (
                <Image
                  source={{ uri: vehicle.images[0] }}
                  style={styles.vehicleImage}
                />
              )}
            </View>
          </View>
        )}

        {/* Payment Information */}
        {trip.pricing && (
          <View style={styles.paymentCard}>
            <Typography style={styles.sectionTitle}>Payment</Typography>

            <View style={styles.paymentMethod}>
              <Ionicons
                name={getPaymentIcon(trip.paymentMethod)}
                size={24}
                color="#333"
              />
              <Typography style={styles.paymentMethodText}>
                {formatPaymentMethod(trip.paymentMethod)}
              </Typography>
            </View>

            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Typography style={styles.priceLabel}>Base Fare</Typography>
                <Typography style={styles.priceValue}>
                  {trip.pricing.baseFare} {trip.pricing.currency}
                </Typography>
              </View>

              <View style={styles.priceRow}>
                <Typography style={styles.priceLabel}>Distance Fare</Typography>
                <Typography style={styles.priceValue}>
                  {trip.pricing.distanceFare} {trip.pricing.currency}
                </Typography>
              </View>

              <View style={styles.priceRow}>
                <Typography style={styles.priceLabel}>Taxes</Typography>
                <Typography style={styles.priceValue}>
                  {trip.pricing.taxes} {trip.pricing.currency}
                </Typography>
              </View>

              <View style={[styles.priceRow, styles.totalRow]}>
                <Typography style={styles.totalLabel}>Total</Typography>
                <Typography style={styles.totalValue}>
                  {trip.pricing.total} {trip.pricing.currency}
                </Typography>
              </View>
            </View>
          </View>
        )}

        {/* Cancellation Information */}
        {trip.status === "cancelled" && trip.cancellationReason && (
          <View style={styles.cancellationCard}>
            <Typography style={styles.sectionTitle}>Cancellation</Typography>
            <Typography style={styles.cancellationReason}>
              {trip.cancellationReason}
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Cancel Trip Button (only shown for cancellable trips) */}
      {isCancellable && (
        <View
          style={[
            styles.cancelButtonContainer,
            { paddingBottom: bottom || 16 },
          ]}
        >
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setCancelModalVisible(true)}
          >
            <Typography style={styles.cancelButtonText}>Cancel Trip</Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancellation Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Typography style={styles.modalTitle}>Cancel Trip</Typography>
            <Typography style={styles.modalDescription}>
              Are you sure you want to cancel this trip? Please provide a
              reason:
            </Typography>

            <TextInput
              style={styles.reasonInput}
              placeholder="Reason for cancellation"
              value={cancellationReason}
              onChangeText={setCancellationReason}
              multiline={true}
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setCancelModalVisible(false)}
                disabled={isSubmitting}
              >
                <Typography style={styles.cancelModalButtonText}>
                  Back
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleCancelTrip}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Typography style={styles.confirmModalButtonText}>
                    Confirm
                  </Typography>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper functions
function getStatusStyle(status: string) {
  switch (status) {
    case "searching":
      return {
        container: { backgroundColor: "#E0F7FA" },
        text: { color: "#006064" },
      };
    case "driverMatched":
      return {
        container: { backgroundColor: "#E8F5E9" },
        text: { color: "#1B5E20" },
      };
    case "driverApproaching":
      return {
        container: { backgroundColor: "#FFF9C4" },
        text: { color: "#F57F17" },
      };
    case "driverArrived":
      return {
        container: { backgroundColor: "#FFE0B2" },
        text: { color: "#E65100" },
      };
    case "inProgress":
      return {
        container: { backgroundColor: "#C8E6C9" },
        text: { color: "#2E7D32" },
      };
    case "completed":
      return {
        container: { backgroundColor: "#BBDEFB" },
        text: { color: "#1565C0" },
      };
    case "cancelled":
      return {
        container: { backgroundColor: "#FFCDD2" },
        text: { color: "#C62828" },
      };
    default:
      return {
        container: { backgroundColor: "#e0e0e0" },
        text: { color: "#000000" },
      };
  }
}

function getPaymentIcon(paymentMethod?: string) {
  switch (paymentMethod) {
    case "card":
      return "card-outline";
    case "cash":
      return "cash-outline";
    case "mobile":
      return "phone-portrait-outline";
    default:
      return "wallet-outline";
  }
}

function formatPaymentMethod(paymentMethod?: string) {
  switch (paymentMethod) {
    case "card":
      return "Credit/Debit Card";
    case "cash":
      return "Cash";
    case "mobile":
      return "Mobile Payment";
    default:
      return "Unknown";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
  },
  routeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    marginRight: 12,
    marginTop: 4,
  },
  destinationDot: {
    backgroundColor: "#F44336",
  },
  locationLine: {
    width: 2,
    height: 30,
    backgroundColor: "#e0e0e0",
    marginLeft: 5,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
  },
  estimateRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  estimateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  estimateText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  driverCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  driverImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  vehicleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
    color: "#666",
  },
  vehicleImage: {
    width: 80,
    height: 50,
    borderRadius: 4,
  },
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  priceBreakdown: {},
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 14,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancellationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancellationReason: {
    fontSize: 14,
    color: "#666",
  },
  cancelButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalButton: {
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  confirmModalButton: {
    backgroundColor: "#F44336",
    marginLeft: 8,
  },
  cancelModalButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  confirmModalButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
