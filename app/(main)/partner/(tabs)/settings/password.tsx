import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/form/form-field";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function PasswordScreen() {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    setIsSubmitting(true);
    try {
      // Implement password change logic
      console.log("Changing password:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error changing password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Change Password",
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
          <FormField
            control={form.control}
            name="currentPassword"
            label="Current Password"
            placeholder="Enter current password"
            secureTextEntry
          />

          <FormField
            control={form.control}
            name="newPassword"
            label="New Password"
            placeholder="Enter new password"
            secureTextEntry
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Confirm new password"
            secureTextEntry
          />

          <Button
            title="Update Password"
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
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
