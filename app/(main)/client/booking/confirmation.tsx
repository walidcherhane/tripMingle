// app/(main)/booking/confirmation.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBooking } from "@/context/BookingContext";
import { Check, CreditCard, Wallet, ChevronRight } from "lucide-react-native";
import { PaymentMethod, PaymentMethodType, BookingStep } from "@/types/booking";
import BookingSummary from "@/components/client/booking/booking-summery";

export default function ConfirmationScreen() {
  const theme = useTheme();
  const {
    bookingData,
    setPaymentMethod,
    confirmBooking,
    isLoading,
    goToStep,
    currentStep,
  } = useBooking();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    bookingData.paymentMethod?.id || "cash-1"
  );

  // Mock payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: "card-1",
      type: "card",
      isDefault: true,
      lastFour: "4242",
      cardType: "Visa",
      expiryDate: "12/25",
    },
    {
      id: "cash-1",
      type: "cash",
      isDefault: false,
    },
    {
      id: "mobile-1",
      type: "mobile",
      isDefault: false,
      provider: "MoroccoWallet",
      phoneNumber: "+212612345678",
    },
  ];

  // Make sure we're on the correct step (CONFIRMATION) when this screen mounts
  useEffect(() => {
    console.log(
      "[DEBUG] ConfirmationScreen mounted with current step:",
      currentStep
    );

    // Set the current step to CONFIRMATION to ensure proper navigation
    if (currentStep !== BookingStep.CONFIRMATION) {
      console.log("[DEBUG] Setting step to CONFIRMATION");
      goToStep(BookingStep.CONFIRMATION);
    }
  }, []);

  const handleSelectPaymentMethod = (id: string) => {
    setSelectedPaymentMethod(id);
    const method = paymentMethods.find((m) => m.id === id);
    if (method) {
      setPaymentMethod(method);
    }
  };

  const handleConfirmBooking = async () => {
    // Ensure payment method is selected
    if (!selectedPaymentMethod) {
      Alert.alert(
        "Payment Method Required",
        "Please select a payment method to continue."
      );
      return;
    }

    // Attempt to confirm booking
    const success = await confirmBooking();

    if (!success) {
      Alert.alert(
        "Booking Failed",
        "Unable to confirm your booking. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const renderPaymentMethodIcon = (type: PaymentMethodType) => {
    switch (type) {
      case "card":
        return <CreditCard size={24} color={theme.getColor("primary.brand")} />;
      case "cash":
        return <Wallet size={24} color={theme.getColor("primary.brand")} />;
      case "mobile":
        return <Wallet size={24} color={theme.getColor("primary.brand")} />;
      default:
        return <CreditCard size={24} color={theme.getColor("primary.brand")} />;
    }
  };

  const getPaymentMethodTitle = (method: PaymentMethod): string => {
    switch (method.type) {
      case "card":
        return `${method.cardType} •••• ${method.lastFour}`;
      case "cash":
        return "Cash Payment";
      case "mobile":
        return `${method.provider} (${method.phoneNumber})`;
      default:
        return "Unknown Payment Method";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Booking summary */}
        <BookingSummary bookingData={bookingData} />

        {/* Payment method selection */}
        <Card style={styles.card}>
          <Typography variant="lg" weight="semibold" style={styles.cardTitle}>
            Payment method
          </Typography>

          <View style={styles.paymentMethodsContainer}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  selectedPaymentMethod === method.id && {
                    borderColor: theme.getColor("primary.brand"),
                    backgroundColor: theme.getColor("primary.brand") + "10", // 10% opacity
                  },
                ]}
                onPress={() => handleSelectPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodIcon}>
                  {renderPaymentMethodIcon(method.type)}
                </View>

                <View style={styles.paymentMethodInfo}>
                  <Typography variant="md" weight="medium">
                    {getPaymentMethodTitle(method)}
                  </Typography>

                  {method.isDefault && (
                    <Typography variant="sm" color="primary.brand">
                      Default
                    </Typography>
                  )}
                </View>

                {selectedPaymentMethod === method.id && (
                  <View
                    style={[
                      styles.paymentMethodCheck,
                      { backgroundColor: theme.getColor("primary.brand") },
                    ]}
                  >
                    <Check
                      size={16}
                      color={theme.getColor("primary.lightest")}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addPaymentMethod}>
              <Typography variant="md" color="primary.brand">
                Add payment method
              </Typography>
              <ChevronRight size={20} color={theme.getColor("primary.brand")} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Terms and conditions */}
        <Card style={styles.card}>
          <Typography variant="sm" color="gray.500" style={styles.termsText}>
            By confirming this booking, you agree to our Terms of Service and
            Privacy Policy. Cancellation fees may apply if you cancel within 5
            minutes of driver assignment.
          </Typography>
        </Card>
      </ScrollView>

      {/* Confirmation button */}
      <View style={styles.bottomBar}>
        <Button
          title="Confirm Booking"
          onPress={handleConfirmBooking}
          loading={isLoading}
          style={styles.confirmButton}
        />
      </View>
    </View>
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
  paymentMethodsContainer: {
    gap: 12,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  paymentMethodIcon: {
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  addPaymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  termsText: {
    lineHeight: 20,
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
  confirmButton: {
    width: "100%",
  },
});
