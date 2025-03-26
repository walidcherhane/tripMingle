// components/booking/BookingSummary.tsx
import React from "react";
import { View, StyleSheet, Image } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { BookingData, PriceBreakdown } from "@/types/booking";
import {
  MapPin,
  Navigation,
  Calendar,
  Clock,
  Car,
  Users,
  Briefcase,
  CreditCard,
} from "lucide-react-native";

interface BookingSummaryProps {
  bookingData: BookingData;
  priceBreakdown?: PriceBreakdown;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  bookingData,
  priceBreakdown,
}) => {
  const theme = useTheme();

  const formatDate = (date?: Date): string => {
    if (!date) return "Not set";
    return date.toLocaleDateString();
  };

  const formatTime = (time?: Date): string => {
    if (!time) return "Not set";
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Generate a mock price breakdown if not provided
  const getPriceBreakdown = (): PriceBreakdown => {
    if (priceBreakdown) return priceBreakdown;

    const baseFare = bookingData.selectedVehicle?.baseFare || 50;
    const distanceFare = (bookingData.selectedVehicle?.pricePerKm || 5) * 10; // Assume 10km
    const taxes = (baseFare + distanceFare) * 0.2; // 20% tax

    return {
      baseFare,
      distanceFare,
      taxes,
      total: baseFare + distanceFare + taxes,
      currency: "MAD",
    };
  };

  const calculatedPrice = getPriceBreakdown();

  return (
    <View style={styles.container}>
      {/* Route information */}
      <Card style={styles.card}>
        <Typography variant="lg" weight="semibold" style={styles.cardTitle}>
          Trip route
        </Typography>

        <View style={styles.locationContainer}>
          <View style={styles.locationItem}>
            <View style={styles.locationIcon}>
              <MapPin size={20} color={theme.getColor("primary.brand")} />
            </View>
            <View style={styles.locationDetails}>
              <Typography variant="sm" color="gray.500">
                Pickup
              </Typography>
              <Typography variant="md" weight="medium">
                {bookingData.pickupLocation.address}
              </Typography>
            </View>
          </View>

          <View style={styles.locationDivider} />

          <View style={styles.locationItem}>
            <View style={styles.locationIcon}>
              <Navigation size={20} color={theme.getColor("error")} />
            </View>
            <View style={styles.locationDetails}>
              <Typography variant="sm" color="gray.500">
                Destination
              </Typography>
              <Typography variant="md" weight="medium">
                {bookingData.dropoffLocation.address}
              </Typography>
            </View>
          </View>
        </View>
      </Card>

      {/* Trip details */}
      <Card style={styles.card}>
        <Typography variant="lg" weight="semibold" style={styles.cardTitle}>
          Trip details
        </Typography>

        <View style={styles.detailsContainer}>
          {/* Vehicle */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Car size={20} color={theme.getColor("gray.500")} />
            </View>
            <View style={styles.detailInfo}>
              <Typography variant="md" color="gray.500">
                Vehicle
              </Typography>
              <Typography variant="md" weight="medium">
                {bookingData.selectedVehicle?.name || "Not selected"}
              </Typography>
            </View>
          </View>

          {/* Date & Time */}
          {bookingData.timing.isScheduled ? (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Calendar size={20} color={theme.getColor("gray.500")} />
              </View>
              <View style={styles.detailInfo}>
                <Typography variant="md" color="gray.500">
                  Date & Time
                </Typography>
                <Typography variant="md" weight="medium">
                  {formatDate(bookingData.timing.departureDate)} at{" "}
                  {formatTime(bookingData.timing.departureTime)}
                </Typography>
              </View>
            </View>
          ) : (
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Clock size={20} color={theme.getColor("gray.500")} />
              </View>
              <View style={styles.detailInfo}>
                <Typography variant="md" color="gray.500">
                  Departure
                </Typography>
                <Typography variant="md" weight="medium">
                  As soon as possible
                </Typography>
              </View>
            </View>
          )}

          {/* Passengers */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Users size={20} color={theme.getColor("gray.500")} />
            </View>
            <View style={styles.detailInfo}>
              <Typography variant="md" color="gray.500">
                Passengers
              </Typography>
              <Typography variant="md" weight="medium">
                {bookingData.tripDetails.passengers}
              </Typography>
            </View>
          </View>

          {/* Luggage */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Briefcase size={20} color={theme.getColor("gray.500")} />
            </View>
            <View style={styles.detailInfo}>
              <Typography variant="md" color="gray.500">
                Luggage
              </Typography>
              <Typography variant="md" weight="medium">
                {bookingData.tripDetails.luggage}
              </Typography>
            </View>
          </View>

          {/* Payment method */}
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <CreditCard size={20} color={theme.getColor("gray.500")} />
            </View>
            <View style={styles.detailInfo}>
              <Typography variant="md" color="gray.500">
                Payment
              </Typography>
              <Typography variant="md" weight="medium">
                {bookingData.paymentMethod?.type === "card"
                  ? `Card ending in ${bookingData.paymentMethod.lastFour}`
                  : bookingData.paymentMethod?.type === "cash"
                  ? "Cash"
                  : "Not selected"}
              </Typography>
            </View>
          </View>
        </View>
      </Card>

      {/* Price breakdown */}
      <Card style={styles.card}>
        <Typography variant="lg" weight="semibold" style={styles.cardTitle}>
          Price breakdown
        </Typography>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Typography variant="md" color="gray.500">
              Base fare
            </Typography>
            <Typography variant="md">
              {calculatedPrice.baseFare} {calculatedPrice.currency}
            </Typography>
          </View>

          <View style={styles.priceRow}>
            <Typography variant="md" color="gray.500">
              Distance fare
            </Typography>
            <Typography variant="md">
              {calculatedPrice.distanceFare} {calculatedPrice.currency}
            </Typography>
          </View>

          {calculatedPrice.timeFare && (
            <View style={styles.priceRow}>
              <Typography variant="md" color="gray.500">
                Time fare
              </Typography>
              <Typography variant="md">
                {calculatedPrice.timeFare} {calculatedPrice.currency}
              </Typography>
            </View>
          )}

          {calculatedPrice.waitingFee && (
            <View style={styles.priceRow}>
              <Typography variant="md" color="gray.500">
                Waiting fee
              </Typography>
              <Typography variant="md">
                {calculatedPrice.waitingFee} {calculatedPrice.currency}
              </Typography>
            </View>
          )}

          <View style={styles.priceRow}>
            <Typography variant="md" color="gray.500">
              Taxes
            </Typography>
            <Typography variant="md">
              {calculatedPrice.taxes} {calculatedPrice.currency}
            </Typography>
          </View>

          <View style={[styles.priceRow, styles.totalRow]}>
            <Typography variant="lg" weight="semibold">
              Total
            </Typography>
            <Typography variant="xl" weight="bold" color="primary.brand">
              {calculatedPrice.total} {calculatedPrice.currency}
            </Typography>
          </View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  locationContainer: {
    gap: 12,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationIcon: {
    width: 40,
    alignItems: "center",
    marginTop: 2,
  },
  locationDetails: {
    flex: 1,
  },
  locationDivider: {
    height: 24,
    width: 1,
    backgroundColor: "#E5E7EB",
    marginLeft: 20,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    width: 40,
    alignItems: "center",
  },
  detailInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
});

export default BookingSummary;
