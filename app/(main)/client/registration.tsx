import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import { useClientInfoForm } from "@/hooks/useRegistrationForms";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Controller } from "react-hook-form";
import Checkbox from "@/components/ui/checkbox";
import FormError from "@/components/form/form-error";
import { useAuthActions } from "@convex-dev/auth/react";
import { User, Shield } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { routeUser, UserProfile } from "@/utils/routingUtils";
import { usePathname } from "expo-router";

const ClientRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useClientInfoForm();
  useFormPersistence(form, "clientInfo");
  const { signIn } = useAuthActions();

  // Get the current authenticated user
  const currentUser = useQuery(api.auth.getMe);
  const pathname = usePathname();

  // // Check user authentication and registration status
  // useEffect(() => {
  //   // Route the user based on their status if we have user data
  //   if (currentUser) {
  //     routeUser(currentUser, pathname);
  //     setIsLoading(false);
  //   }
  // }, [currentUser, pathname]);

  // Handle form submission
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      // Submit to Convex auth with account type
      await signIn("password", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        userType: "client",
        flow: "signUp",
      });

      // Store basic info in AsyncStorage for persistence
      await AsyncStorage.setItem("@user_first_name", data.firstName);
      await AsyncStorage.setItem("@user_last_name", data.lastName);

      // Navigate to client tabs as they don't need further verification
      router.replace("/(main)/client/(tabs)");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Typography variant="md" style={styles.loadingText}>
          Loading...
        </Typography>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Typography variant="xl" weight="bold" style={styles.title}>
              Create Traveler Account
            </Typography>
            <Typography variant="sm" color="gray.500" style={styles.subtitle}>
              Register as a traveler to book trips and explore Morocco
            </Typography>
          </View>

          {/* Personal Information Section */}
          <View style={styles.row}>
            <View style={styles.flex}>
              <FormField
                control={form.control}
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
              />
            </View>
            <View style={styles.flex}>
              <FormField
                control={form.control}
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
              />
            </View>
          </View>

          <FormField
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
          />

          <FormField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Create a password"
            secureTextEntry
          />
          <FormField
            control={form.control}
            name="passwordConfirmation"
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
          />

          {/* Terms and Conditions */}
          <Controller
            control={form.control}
            name="termsAccepted"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.checkboxContainer}>
                <View style={styles.checkboxRow}>
                  <Checkbox checked={value} onPress={() => onChange(!value)} />
                  <Typography variant="sm" style={styles.checkboxLabel}>
                    I agree to the terms of service and privacy policy
                  </Typography>
                </View>
                <FormError error={error} />
              </View>
            )}
          />

          {/* Submit Button */}
          <Button
            title="Create Account"
            onPress={onSubmit}
            loading={isSubmitting}
            style={styles.submitButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Typography variant="sm" color="gray.500">
              Already have an account?
            </Typography>
            <Link href="/(auth)/login" style={styles.loginButton}>
              Login
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  checkboxContainer: {
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  checkboxLabel: {
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  loginButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
  },
});

export default ClientRegistration;
