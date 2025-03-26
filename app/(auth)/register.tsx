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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Define the registration schema
const registrationSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
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

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegisterScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuthActions();

  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const getUserType = async () => {
      const type = await AsyncStorage.getItem("@selected_account_type");
      setUserType(type);
    };
    getUserType();
  }, []);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegistrationForm) => {
    setIsSubmitting(true);
    try {
      // Sign up with Convex Auth
      await signIn("password", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: userType,
        flow: "signUp",
      });
    } catch (error) {
      console.error("Error registering:", error);
      Alert.alert(
        "Registration Error",
        "There was a problem creating your account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create Account",
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
              {userType === "traveler"
                ? "Create Traveler Account"
                : "Create Vehicle Owner Account"}
            </Typography>
            <Typography
              variant="md"
              color="gray.600"
              align="center"
              style={styles.subtitle}
            >
              {userType === "traveler"
                ? "Create your account to start booking vehicles"
                : "Create your account to list your vehicles"}
            </Typography>
          </View>

          <FormField
            control={form.control}
            name="firstName"
            label="First Name"
            placeholder="Enter your first name"
          />

          <FormField
            control={form.control}
            name="lastName"
            label="Last Name"
            placeholder="Enter your last name"
          />

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
            title="Create Account"
            onPress={form.handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.submitButton}
          />

          <Button
            title="Already have an account? Sign In"
            variant="secondary"
            onPress={() => router.push("/(auth)/login")}
            style={styles.signInButton}
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
  signInButton: {
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
