import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert, Modal } from "react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/theme";
import {
  MapPin,
  Clock,
  DollarSign,
  AlertTriangle,
  Car,
} from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { ViewStyle } from "react-native";

interface TripRequestProps {
  trip: Doc<"trips">;
}

export const TripRequest = ({ trip }: TripRequestProps) => {
  const currentUser = useQuery(api.auth.getMe);

  const vehicle = useQuery(api.vehicles.getVehicle, {
    vehicleId: trip.vehicleId!,
  });

  const { colors } = useTheme();
  const [isRefuseModalVisible, setIsRefuseModalVisible] = useState(false);
  const [refusalReason, setRefusalReason] = useState("");

  // Mutations
  const acceptTrip = useMutation(api.trips.acceptTrip);
  const refuseTrip = useMutation(api.trips.refuseTrip);

  const calculateEstimatedArrival = (distance: number, speed: number) => {
    const timeInHours = distance / speed;
    const timeInMinutes = timeInHours * 60;
    return timeInMinutes;
  };

  // Handle accept
  const handleAccept = (
    tripId: Id<"trips">,
    partnerId: Id<"users">,
    vehicleId: Id<"vehicles">
  ) => {
    try {
      const estimatedArrival = calculateEstimatedArrival(
        trip.estimatedDistance || 0,
        60 // Assuming 60 km/h speed
      );

      acceptTrip({
        tripId,
        partnerId,
        vehicleId,
        estimatedArrival,
      });

      Alert.alert("Success", "Trip accepted successfully");
    } catch (error) {
      console.error("Error accepting trip:", error);
      Alert.alert("Error", "Failed to accept trip. Please try again.");
    }
  };

  // Show refuse modal
  const showRefuseModal = () => {
    if (!trip) return;
    setIsRefuseModalVisible(true);
  };

  // Handle refuse
  const handleRefuse = () => {
    try {
      refuseTrip({
        tripId: trip._id,
        partnerId: currentUser?._id!,
        refusalReason: refusalReason.trim(),
      });

      setIsRefuseModalVisible(false);
      setRefusalReason("");
      Alert.alert(
        "Trip Refused",
        "You've refused the trip request. The client has been notified."
      );
    } catch (error) {
      console.error("Error refusing trip:", error);
      Alert.alert(
        "Error",
        "Failed to refuse trip. Please check your connection and try again."
      );
    }
  };

  // Empty state if no trip requests
  if (!trip) {
    return null;
  }

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerBadge}>
            <AlertTriangle
              size={16}
              color={colors?.warning || theme.colors.warning}
            />
            <Typography
              variant="sm"
              weight="medium"
              style={{
                color: colors?.warning || theme.colors.warning,
                marginLeft: 4,
              }}
            >
              New Trip Request
            </Typography>
          </View>
          <Typography variant="lg" weight="bold" style={styles.price}>
            {trip.pricing?.total} MAD
          </Typography>
        </View>

        {/* Route info */}
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <MapPin size={20} color={colors?.success || theme.colors.success} />
            <View style={styles.routeInfo}>
              <Typography
                variant="sm"
                style={{ color: colors?.gray[500] || theme.colors.gray[500] }}
              >
                Pickup
              </Typography>
              <Typography variant="md" weight="medium">
                {trip.pickupLocation.address}
              </Typography>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routePoint}>
            <MapPin size={20} color={colors?.error || theme.colors.error} />
            <View style={styles.routeInfo}>
              <Typography
                variant="sm"
                style={{ color: colors?.gray[500] || theme.colors.gray[500] }}
              >
                Drop-off
              </Typography>
              <Typography variant="md" weight="medium">
                {trip.dropoffLocation.address}
              </Typography>
            </View>
          </View>
        </View>

        {/* Trip details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Clock
              size={16}
              color={colors?.gray[500] || theme.colors.gray[500]}
            />
            <Typography
              variant="sm"
              style={{ color: colors?.gray[500] || theme.colors.gray[500] }}
            >
              {trip.estimatedDuration} min
            </Typography>
          </View>
          {vehicle && (
            <View style={styles.detailItem}>
              <Car
                size={16}
                color={colors?.gray[500] || theme.colors.gray[500]}
              />
              <Typography
                variant="sm"
                style={{ color: colors?.gray[500] || theme.colors.gray[500] }}
              >
                {vehicle.category}
              </Typography>
            </View>
          )}

          <View style={styles.detailItem}>
            <DollarSign
              size={16}
              color={colors?.primary.brand || theme.colors.primary.brand}
            />
            <Typography
              variant="sm"
              weight="medium"
              style={{
                color: colors?.primary.brand || theme.colors.primary.brand,
              }}
            >
              Estimated earnings: {trip.pricing?.total} MAD
            </Typography>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Accept"
            style={{ ...styles.actionButton, ...styles.acceptButton }}
            onPress={() =>
              handleAccept(trip._id, currentUser?._id!, trip.vehicleId!)
            }
          />
          <Button
            title="Refuse"
            variant="secondary"
            style={styles.actionButton}
            onPress={showRefuseModal}
          />
        </View>
      </Card>

      {/* Refuse Modal */}
      <Modal
        visible={isRefuseModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRefuseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Typography variant="lg" weight="semibold">
                Refuse Trip
              </Typography>
            </View>

            <View style={styles.modalContent}>
              <Typography variant="md" style={styles.modalText}>
                Please provide a reason for refusing this trip:
              </Typography>
              <TextInput
                style={styles.reasonInput}
                placeholder="Enter reason for refusal"
                value={refusalReason}
                onChangeText={setRefusalReason}
                multiline
                numberOfLines={3}
              />
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setIsRefuseModalVisible(false)}
                  style={styles.modalButton}
                />
                <Button
                  title="Refuse Trip"
                  onPress={handleRefuse}
                  style={{ ...styles.modalButton, ...styles.refuseButton }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 8,
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7", // Light amber for warning
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  price: {
    marginTop: 8,
  },
  routeContainer: {
    gap: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeDivider: {
    width: 2,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginLeft: 10,
  },
  detailsContainer: {
    marginTop: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  refuseButton: {
    backgroundColor: theme.colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalContent: {
    padding: 16,
  },
  modalText: {
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    minWidth: 120,
  },
});
