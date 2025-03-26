import React, { useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Typography } from "@/components/ui/typography";

const VerificationStatusScreen = () => {
  const [loading, setLoading] = useState(true);

  // Get the current user directly without using the routing hook
  // This prevents redirection loops
  const currentUser = useQuery(api.auth.getMe);

  // Query the user by email to get the complete user profile
  const partnerUser = useQuery(
    api.users.getUserByEmail,
    currentUser?.email ? { email: currentUser.email } : "skip"
  );

  // Set loading state based on data availability
  if (partnerUser && loading) {
    setLoading(false);
  }

  if (loading || !partnerUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.brand} />
      </View>
    );
  }

  const renderStatusContent = () => {
    switch (partnerUser.verificationStatus) {
      case "pending":
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="time-outline"
                size={80}
                color={theme.colors.warning}
              />
            </View>
            <Typography style={styles.title}>Verification Pending</Typography>
            <Typography style={styles.description}>
              Your account is currently under review. This process typically
              takes 1-2 business days. We'll notify you once your account is
              approved.
            </Typography>
            <View style={styles.infoBox}>
              <Typography style={styles.infoTitle}>
                What happens next?
              </Typography>
              <Typography style={styles.infoText}>
                1. Our team reviews your submitted documents
              </Typography>
              <Typography style={styles.infoText}>
                2. You'll receive a notification when approved
              </Typography>
              <Typography style={styles.infoText}>
                3. Once approved, you can start using all partner features
              </Typography>
            </View>
          </>
        );
      case "rejected":
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="close-circle-outline"
                size={80}
                color={theme.colors.error}
              />
            </View>
            <Typography style={styles.title}>Verification Rejected</Typography>
            <Typography style={styles.description}>
              Unfortunately, your verification has been rejected. This may be
              due to incomplete or invalid documentation. Please review your
              information and try again.
            </Typography>
            <Button
              title="Update Information"
              onPress={() => router.push("/partner/registration")}
              style={styles.updateButton}
            />
          </>
        );
      case "approved":
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={80}
                color={theme.colors.success}
              />
            </View>
            <Typography style={styles.title}>Verification Approved!</Typography>
            <Typography style={styles.description}>
              Congratulations! Your account has been verified. You can now
              access all partner features.
            </Typography>
            <Button
              title="Go to Dashboard"
              onPress={() => router.push("/partner")}
              style={styles.dashboardButton}
            />
          </>
        );
      default:
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons
                name="help-circle-outline"
                size={80}
                color={theme.colors.info}
              />
            </View>
            <Typography style={styles.title}>
              Verification Status Unknown
            </Typography>
            <Typography style={styles.description}>
              We couldn't determine your verification status. Please contact
              support for assistance.
            </Typography>
          </>
        );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Card>{renderStatusContent()}</Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: theme.colors.text,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: theme.colors.gray[700],
  },
  infoBox: {
    backgroundColor: theme.colors.gray[100],
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: theme.colors.text,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: theme.colors.gray[700],
  },
  updateButton: {
    marginTop: 16,
  },
  dashboardButton: {
    marginTop: 16,
    backgroundColor: theme.colors.success,
  },
});

export default VerificationStatusScreen;
