import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/theme/colors";
import { CarFront, Briefcase } from "lucide-react-native";
import { routeToRegistration } from "@/utils/routingUtils";

const AccountTypeScreen = () => {
  const [selectedType, setSelectedType] = useState<"client" | "partner" | null>(
    null
  );

  const handleContinue = async () => {
    if (!selectedType) return;

    // Save the selected account type to AsyncStorage for later use
    await AsyncStorage.setItem("@selected_account_type", selectedType);

    // Use the routing utility to navigate to the appropriate registration page
    routeToRegistration(selectedType);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Typography variant="xl" weight="bold" style={styles.title}>
            Choose Account Type
          </Typography>
          <Typography variant="sm" color="gray.500" style={styles.subtitle}>
            Select the type of account you'd like to create
          </Typography>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === "client" && styles.selectedCard,
            ]}
            onPress={() => setSelectedType("client")}
          >
            <View style={styles.iconContainer}>
              <Briefcase
                size={40}
                color={
                  selectedType === "client"
                    ? colors.primary.brand
                    : colors.gray[400]
                }
              />
            </View>
            <Typography
              variant="lg"
              weight="semibold"
              style={
                selectedType === "client"
                  ? { ...styles.optionTitle, ...styles.selectedText }
                  : styles.optionTitle
              }
            >
              Traveler
            </Typography>
            <Typography
              variant="sm"
              color="gray.500"
              style={styles.optionDescription}
            >
              Book trips and explore Morocco with ease
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === "partner" && styles.selectedCard,
            ]}
            onPress={() => setSelectedType("partner")}
          >
            <View style={styles.iconContainer}>
              <CarFront
                size={40}
                color={
                  selectedType === "partner"
                    ? colors.primary.brand
                    : colors.gray[400]
                }
              />
            </View>
            <Typography
              variant="lg"
              weight="semibold"
              style={
                selectedType === "partner"
                  ? { ...styles.optionTitle, ...styles.selectedText }
                  : styles.optionTitle
              }
            >
              Vehicle Owner
            </Typography>
            <Typography
              variant="sm"
              color="gray.500"
              style={styles.optionDescription}
            >
              Register your vehicle and earn income as a partner
            </Typography>
          </TouchableOpacity>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedType}
          style={styles.continueButton}
        />

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={styles.loginLink}
        >
          <Typography variant="sm" color="gray.500">
            Already have an account?{" "}
            <Typography color="primary.brand" style={styles.loginText}>
              Sign in
            </Typography>
          </Typography>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 36,
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 36,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: colors.primary.brand,
    backgroundColor: colors.primary.lightest,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  optionTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  selectedText: {
    color: colors.primary.brand,
  },
  optionDescription: {
    textAlign: "center",
  },
  continueButton: {
    marginBottom: 24,
  },
  loginLink: {
    alignItems: "center",
  },
  loginText: {
    color: colors.primary.brand,
    fontWeight: "600",
  },
});

export default AccountTypeScreen;
