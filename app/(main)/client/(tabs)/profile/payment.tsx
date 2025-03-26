import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Plus, Trash2, CheckCircle, X } from "lucide-react-native";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Mock payment methods
const mockPaymentMethods = [
  {
    id: "1",
    type: "visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
  },
  {
    id: "2",
    type: "mastercard",
    last4: "5555",
    expMonth: 10,
    expYear: 2024,
    isDefault: false,
  },
];

const paymentFormSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(19, "Card number must be at most 19 digits"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  expiryMonth: z
    .string()
    .min(1, "Month is required")
    .max(2, "Month must be 1 or 2 digits"),
  expiryYear: z
    .string()
    .min(2, "Year is required")
    .max(4, "Year must be 2 or 4 digits"),
  cvv: z
    .string()
    .min(3, "CVV must be 3 or 4 digits")
    .max(4, "CVV must be 3 or 4 digits"),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export default function PaymentScreen() {
  const theme = useTheme();
  const currentUser = useQuery(api.auth.getMe);
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    },
  });

  const handleAddCard = (data: PaymentFormData) => {
    // In a real app, this would call a payment processor API
    const newCard = {
      id: Math.random().toString(),
      type: data.cardNumber.startsWith("4") ? "visa" : "mastercard",
      last4: data.cardNumber.slice(-4),
      expMonth: parseInt(data.expiryMonth),
      expYear: parseInt(data.expiryYear),
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods([...paymentMethods, newCard]);
    setModalVisible(false);
    reset();
    Alert.alert("Success", "Payment method added successfully");
  };

  const handleDeleteCard = (id: string) => {
    Alert.alert(
      "Delete Payment Method",
      "Are you sure you want to delete this payment method?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedMethods = paymentMethods.filter(
              (method) => method.id !== id
            );

            // If we deleted the default card and there are other cards, make the first one default
            if (
              paymentMethods.find((m) => m.id === id)?.isDefault &&
              updatedMethods.length > 0
            ) {
              updatedMethods[0].isDefault = true;
            }

            setPaymentMethods(updatedMethods);
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    const updatedMethods = paymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === id,
    }));
    setPaymentMethods(updatedMethods);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Typography variant="lg" weight="semibold">
              Payment Methods
            </Typography>
            <Typography
              variant="sm"
              style={{ color: theme.colors.gray[500], marginTop: 4 }}
            >
              Manage your payment methods
            </Typography>
          </View>

          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethod}>
              <View style={styles.cardInfo}>
                <View
                  style={[
                    styles.cardIconContainer,
                    { backgroundColor: theme.colors.primary.lightest },
                  ]}
                >
                  <CreditCard size={20} color={theme.colors.primary.brand} />
                </View>
                <View style={styles.cardDetails}>
                  <View style={styles.cardTypeRow}>
                    <Typography variant="md" weight="medium">
                      {method.type.charAt(0).toUpperCase() +
                        method.type.slice(1)}
                    </Typography>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Typography
                          variant="xs"
                          style={{ color: theme.colors.primary.brand }}
                        >
                          Default
                        </Typography>
                      </View>
                    )}
                  </View>
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    •••• {method.last4}
                  </Typography>
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    Expires {method.expMonth}/{method.expYear}
                  </Typography>
                </View>
              </View>
              <View style={styles.cardActions}>
                {!method.isDefault && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.cardAction,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <CheckCircle size={16} color={theme.colors.primary.brand} />
                    <Typography
                      variant="xs"
                      style={{
                        color: theme.colors.primary.brand,
                        marginLeft: 4,
                      }}
                    >
                      Set Default
                    </Typography>
                  </Pressable>
                )}
                <Pressable
                  style={({ pressed }) => [
                    styles.cardAction,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleDeleteCard(method.id)}
                >
                  <Trash2 size={16} color={theme.colors.error} />
                  <Typography
                    variant="xs"
                    style={{ color: theme.colors.error, marginLeft: 4 }}
                  >
                    Delete
                  </Typography>
                </Pressable>
              </View>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.addCardButton,
              pressed && styles.pressed,
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={20} color={theme.colors.primary.brand} />
            <Typography
              variant="md"
              weight="medium"
              style={{ color: theme.colors.primary.brand, marginLeft: 8 }}
            >
              Add Payment Method
            </Typography>
          </Pressable>
        </Card>

        <Card style={styles.billingCard}>
          <Typography variant="lg" weight="semibold">
            Billing Information
          </Typography>
          <Typography
            variant="sm"
            style={{
              color: theme.colors.gray[500],
              marginTop: 4,
              marginBottom: 16,
            }}
          >
            Your billing address will be used for invoices
          </Typography>

          <View style={styles.billingInfo}>
            <Typography variant="md" weight="medium">
              {currentUser?.firstName} {currentUser?.lastName}
            </Typography>
            <Typography
              variant="sm"
              style={{ color: theme.colors.gray[500], marginTop: 4 }}
            >
              {currentUser?.email}
            </Typography>
          </View>
        </Card>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="lg" weight="semibold">
                Add Payment Method
              </Typography>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Controller
                control={control}
                name="cardNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.cardNumber?.message}
                    containerStyle={styles.inputContainer}
                    keyboardType="numeric"
                  />
                )}
              />

              <Controller
                control={control}
                name="cardholderName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Cardholder Name"
                    placeholder="John Doe"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.cardholderName?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />

              <View style={styles.expiryRow}>
                <View style={styles.expiryField}>
                  <Controller
                    control={control}
                    name="expiryMonth"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Month"
                        placeholder="MM"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.expiryMonth?.message}
                        containerStyle={styles.inputContainer}
                        keyboardType="numeric"
                      />
                    )}
                  />
                </View>
                <View style={styles.expiryField}>
                  <Controller
                    control={control}
                    name="expiryYear"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Year"
                        placeholder="YYYY"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.expiryYear?.message}
                        containerStyle={styles.inputContainer}
                        keyboardType="numeric"
                      />
                    )}
                  />
                </View>
                <View style={styles.cvvField}>
                  <Controller
                    control={control}
                    name="cvv"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="CVV"
                        placeholder="123"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.cvv?.message}
                        containerStyle={styles.inputContainer}
                        keyboardType="numeric"
                        secureTextEntry
                      />
                    )}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={() => setModalVisible(false)}
                variant="secondary"
                style={styles.cancelButton}
                title="Cancel"
              />
              <Button
                onPress={handleSubmit(handleAddCard)}
                style={styles.addButton}
                title="Add Card"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  paymentMethod: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardTypeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  defaultBadge: {
    backgroundColor: "#E6F7FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  billingCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  billingInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  expiryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expiryField: {
    width: "30%",
  },
  cvvField: {
    width: "30%",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    flex: 1,
    marginLeft: 8,
  },
});
