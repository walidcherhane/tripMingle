import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { Link, router } from "expo-router";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Controller } from "react-hook-form";
import Checkbox from "@/components/ui/checkbox";
import FormError from "@/components/form/form-error";
import { useAuthActions } from "@convex-dev/auth/react";
import { colors } from "@/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { routeUser, UserProfile } from "@/utils/routingUtils";
import { usePathname } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Basic partner info schema
const partnerBasicInfoSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirmation: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

type PartnerBasicInfoForm = z.infer<typeof partnerBasicInfoSchema>;

const PartnerBasicInfo = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuthActions();
  const pathname = usePathname();

  // Get the current authenticated user
  const currentUser = useQuery(api.auth.getMe);

  // Initialize form
  const form = useForm<PartnerBasicInfoForm>({
    resolver: zodResolver(partnerBasicInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      termsAccepted: false,
    },
    mode: "onChange",
  });

  // Check user authentication and registration status
  useEffect(() => {
    if (currentUser) {
      // Route the user based on their status
      routeUser(currentUser, pathname);
    }
  }, [currentUser, pathname]);

  // Check if we have the account type selected
  useEffect(() => {
    const checkAccountType = async () => {
      const accountType = await AsyncStorage.getItem("@selected_account_type");
      if (!accountType) {
        // Redirect to account type selection if no account type is set
        router.replace("/(auth)/account-type");
      } else if (accountType !== "partner") {
        // Redirect if somehow ended up in the wrong flow
        if (accountType === "client") {
          router.replace("/(main)/client/registration");
        } else {
          router.replace("/(auth)/account-type");
        }
      }
    };

    checkAccountType();
  }, []);

  // Handle form submission
  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setIsSubmitting(true);

      // Create the Convex auth account
      await signIn("password", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        userType: "partner",
        flow: "signUp",
      });

      // Store basic info in AsyncStorage for persistence
      await AsyncStorage.setItem("@user_first_name", data.firstName);
      await AsyncStorage.setItem("@user_last_name", data.lastName);
      await AsyncStorage.setItem("@user_email", data.email);

      // Navigate to the detailed registration form
      router.replace("/(main)/partner/registration");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoid}
    >
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Typography variant="xl" weight="bold" style={styles.title}>
              Create Partner Account
            </Typography>
            <Typography variant="sm" color="gray.500" style={styles.subtitle}>
              First, let's set up your basic account information
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
            title="Continue to Registration"
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
});

export default PartnerBasicInfo;
