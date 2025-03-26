// app/(main)/booking/details.tsx
import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBooking } from "@/context/BookingContext";
import { ArrowRight, MessageSquare } from "lucide-react-native";
import TripScheduler from "@/components/client/booking/trip-scheduler";
import { BookingStep } from "@/types/booking";

export default function TripDetailsScreen() {
  const theme = useTheme();
  const {
    bookingData,
    setTiming,
    setTripDetails,
    goToNextStep,
    goToStep,
    currentStep,
  } = useBooking();

  const [specialRequests, setSpecialRequests] = React.useState(
    bookingData.tripDetails.specialRequests || ""
  );

  // Make sure we're on the correct step (DETAILS) when this screen mounts
  useEffect(() => {
    console.log(
      "[DEBUG] DetailsScreen mounted with current step:",
      currentStep
    );

    // Set the current step to DETAILS to ensure proper navigation
    if (currentStep !== BookingStep.DETAILS) {
      console.log("[DEBUG] Setting step to DETAILS");
      goToStep(BookingStep.DETAILS);
    }
  }, []);

  const handleUpdateTripDetails = () => {
    // Update trip details with special requests
    setTripDetails({
      ...bookingData.tripDetails,
      specialRequests,
    });

    // Continue to next step
    goToNextStep();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Trip scheduler component */}
        <TripScheduler
          timing={bookingData.timing}
          details={bookingData.tripDetails}
          onTimingChange={setTiming}
          onDetailsChange={setTripDetails}
        />

        {/* Special requests */}
        <Card style={styles.card}>
          <Typography variant="lg" weight="semibold" style={styles.cardTitle}>
            Special requests
          </Typography>

          <View style={styles.specialRequestsContainer}>
            <View style={styles.textInputContainer}>
              <MessageSquare size={20} color={theme.getColor("gray.500")} />
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.getColor("text"),
                    fontFamily: theme.typography.fontFamily,
                  },
                ]}
                placeholder="Any special requests for the driver?"
                placeholderTextColor={theme.getColor("gray.400")}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={specialRequests}
                onChangeText={setSpecialRequests}
              />
            </View>

            <Typography
              variant="sm"
              color="gray.500"
              style={styles.specialRequestsHint}
            >
              Let the driver know if you need help with luggage, if you have a
              preferred route, or any other special requirements.
            </Typography>
          </View>
        </Card>

        {/* Trip summary */}
        <Card style={styles.card}>
          <Typography variant="lg" weight="semibold" style={styles.cardTitle}>
            Trip summary
          </Typography>

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Typography variant="md" color="gray.500">
                Passengers
              </Typography>
              <Typography variant="md" weight="semibold">
                {bookingData.tripDetails.passengers}
              </Typography>
            </View>

            <View style={styles.summaryRow}>
              <Typography variant="md" color="gray.500">
                Luggage
              </Typography>
              <Typography variant="md" weight="semibold">
                {bookingData.tripDetails.luggage}
              </Typography>
            </View>

            <View style={styles.summaryRow}>
              <Typography variant="md" color="gray.500">
                Departure
              </Typography>
              <Typography variant="md" weight="semibold">
                {bookingData.timing.isScheduled
                  ? bookingData.timing.departureDate
                    ? `${bookingData.timing.departureDate.toLocaleDateString()} at ${
                        bookingData.timing.departureTime?.toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        ) || "Not set"
                      }`
                    : "Not set"
                  : "As soon as possible"}
              </Typography>
            </View>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title="Continue"
          onPress={handleUpdateTripDetails}
          rightIcon={<ArrowRight />}
          style={styles.continueButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for the bottom bar
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  specialRequestsContainer: {
    gap: 8,
  },
  textInputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    alignItems: "flex-start",
  },
  textInput: {
    flex: 1,
    paddingLeft: 8,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 96,
  },
  specialRequestsHint: {
    paddingHorizontal: 8,
  },
  summaryContainer: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  continueButton: {
    width: "100%",
  },
});
