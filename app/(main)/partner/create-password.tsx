import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { theme } from "@/theme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/form/form-field";
import { useAuthActions } from "@convex-dev/auth/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Define the password schema
const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function CreatePasswordScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useQuery(api.auth.getMe);
  const { signIn } = useAuthActions();

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // // If no partner email is found or user doesn't exist, redirect to registration
  // if (!currentUser?.email || !partnerUser) {
  //   router.replace("/(auth)/account-type");
  //   return null;
  // }

  // // If user is not approved, redirect to verification status
  // if (partnerUser.verificationStatus !== "approved") {
  //   router.replace("/partner/verification-status");
  //   return null;
  // }

  const onSubmit = async (data: PasswordForm) => {
    setIsSubmitting(true);
    try {
      if (!currentUser?.email) {
        Alert.alert("Error", "User information not found. Please try again.");
        return;
      }

      // Create password and sign in
      await signIn("password", {
        email: currentUser.email,
        password: data.password,
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        userType: "partner",
        flow: "signUp",
      });

      // Navigate to partner home
      router.replace("/(main)/partner/(tabs)");
    } catch (error) {
      console.error("Error creating password:", error);
      Alert.alert(
        "Error",
        "There was a problem creating your password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create Password",
          headerBackVisible: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Typography variant="xl" weight="bold" align="center">
              Create Your Password
            </Typography>
            <Typography
              variant="md"
              color="gray.600"
              align="center"
              style={styles.subtitle}
            >
              Your account has been verified! Create a password to access your
              account.
            </Typography>
          </View>

          <FormField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
          />

          <View style={styles.passwordRequirements}>
            <Typography variant="sm" color="gray.600" weight="medium">
              Password Requirements:
            </Typography>
            <Typography variant="xs" color="gray.600">
              • At least 8 characters
            </Typography>
            <Typography variant="xs" color="gray.600">
              • At least one uppercase letter
            </Typography>
            <Typography variant="xs" color="gray.600">
              • At least one lowercase letter
            </Typography>
            <Typography variant="xs" color="gray.600">
              • At least one number
            </Typography>
          </View>

          <Button
            title="Create Password & Sign In"
            onPress={form.handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  header: {
    marginBottom: 16,
    gap: 8,
  },
  subtitle: {
    marginBottom: 8,
  },
  passwordRequirements: {
    backgroundColor: theme.colors.gray[100],
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    gap: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
