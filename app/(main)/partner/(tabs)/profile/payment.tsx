// app/(main)/partner/profile/payment.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Stack } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import {
  CreditCard,
  Plus,
  ChevronRight,
  AlertCircle,
  Clock,
  Building,
} from "lucide-react-native";

// Mock bank account data
const bankAccount = {
  bankName: "Bank Al-Maghrib",
  accountNumber: "•••• •••• 1234",
  holderName: "John Doe",
  verified: true,
};

// Mock payment history
const recentPayments = [
  {
    id: "1",
    amount: 1250,
    status: "completed",
    date: "2024-02-10",
    type: "transfer",
  },
  {
    id: "2",
    amount: 850,
    status: "pending",
    date: "2024-02-09",
    type: "transfer",
  },
];

export default function PaymentScreen() {
  const theme = useTheme();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      // Implement withdrawal logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return theme.colors.success;
      case "pending":
        return theme.colors.warning;
      default:
        return theme.colors.gray[500];
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Payment Methods",
        }}
      />

      <ScrollView style={styles.container}>
        {/* Current Balance */}
        <Card style={styles.balanceCard}>
          <Typography variant="sm" style={{ color: theme.colors.gray[500] }}>
            Available Balance
          </Typography>
          <Typography variant="2xl" weight="bold" style={styles.balance}>
            2,450 MAD
          </Typography>
          <Button
            title="Withdraw"
            onPress={handleWithdraw}
            loading={isWithdrawing}
          />
        </Card>

        {/* Bank Account */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="lg" weight="semibold">
              Bank Account
            </Typography>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Plus size={18} />}
              title="Add New"
              onPress={() => {
                /* Navigate to add bank */
              }}
            />
          </View>

          <View style={styles.bankAccount}>
            <View style={styles.bankInfo}>
              <Building size={20} color={theme.colors.gray[500]} />
              <View style={styles.bankDetails}>
                <Typography variant="md" weight="medium">
                  {bankAccount.bankName}
                </Typography>
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.gray[500] }}
                >
                  {bankAccount.accountNumber}
                </Typography>
              </View>
            </View>
            {bankAccount.verified && (
              <View
                style={[
                  styles.verifiedBadge,
                  { backgroundColor: `${theme.colors.success}15` },
                ]}
              >
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.success }}
                >
                  Verified
                </Typography>
              </View>
            )}
          </View>
        </Card>

        {/* Recent Payments */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="lg" weight="semibold">
              Recent Payments
            </Typography>
            <Button
              size="sm"
              variant="secondary"
              title="See All"
              onPress={() => {
                /* Navigate to payment history */
              }}
            />
          </View>

          {recentPayments.map((payment, index) => (
            <Pressable
              key={payment.id}
              style={[
                styles.paymentItem,
                index < recentPayments.length - 1 && styles.itemBorder,
              ]}
              onPress={() => {
                /* Navigate to payment details */
              }}
            >
              <View style={styles.paymentInfo}>
                <View
                  style={[
                    styles.paymentIcon,
                    { backgroundColor: theme.colors.primary.lightest },
                  ]}
                >
                  <CreditCard size={20} color={theme.colors.primary.brand} />
                </View>
                <View style={styles.paymentDetails}>
                  <Typography variant="md" weight="medium">
                    Bank Transfer
                  </Typography>
                  <View style={styles.paymentMeta}>
                    <Clock size={14} color={theme.colors.gray[500]} />
                    <Typography
                      variant="sm"
                      style={{ color: theme.colors.gray[500], marginLeft: 4 }}
                    >
                      {new Date(payment.date).toLocaleDateString()}
                    </Typography>
                  </View>
                </View>
              </View>

              <View style={styles.paymentRight}>
                <Typography variant="md" weight="semibold">
                  {payment.amount} MAD
                </Typography>
                <View style={styles.paymentStatus}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(payment.status) },
                    ]}
                  />
                  <Typography
                    variant="sm"
                    style={{ color: getStatusColor(payment.status) }}
                  >
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </Typography>
                </View>
              </View>
            </Pressable>
          ))}
        </Card>

        {/* Info Card */}
        <Card style={[styles.section, styles.infoCard]}>
          <AlertCircle size={20} color={theme.colors.primary.brand} />
          <View style={styles.infoText}>
            <Typography variant="sm">
              Withdrawals are processed within 24-48 hours during business days.
            </Typography>
          </View>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  balanceCard: {
    margin: 16,
    alignItems: "center",
  },
  balance: {
    marginVertical: 12,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bankAccount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  bankInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bankDetails: {
    flex: 1,
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentDetails: {
    flex: 1,
  },
  paymentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  paymentRight: {
    alignItems: "flex-end",
  },
  paymentStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
});
