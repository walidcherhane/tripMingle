import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { Controller } from "react-hook-form";
import { useAuthActions } from "@convex-dev/auth/react";
import { Typography } from "@/components/ui/typography";
import {
  usePasswordResetRequestForm,
  useOtpVerificationForm,
  useNewPasswordForm,
} from "@/hooks/useAuthForms";
import {
  PasswordResetRequestForm,
  OtpVerificationForm,
  NewPasswordForm,
} from "@/lib/schemas/auth";

// Steps for password reset flow
enum ResetStep {
  REQUEST = "request",
  VERIFY = "verify",
  RESET = "reset",
}

export default function ResetPasswordScreen() {
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.REQUEST);
  const [email, setEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuthActions();

  // Initialize forms
  const requestForm = usePasswordResetRequestForm();
  const verifyForm = useOtpVerificationForm();
  const resetForm = useNewPasswordForm();

  // Handle password reset request
  const handleResetRequest = async (data: PasswordResetRequestForm) => {
    setIsSubmitting(true);
    try {
      await signIn("password", {
        email: data.email,
        flow: "reset",
      });
      setEmail(data.email);
      setCurrentStep(ResetStep.VERIFY);
    } catch (error) {
      console.error("Error requesting password reset:", error);
      Alert.alert(
        "Error",
        "There was a problem sending the reset code. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification and password reset
  const handleVerifyOTP = async (data: OtpVerificationForm) => {
    console.log("🚀 ~ handleVerifyOTP ~ data:", data);
    setIsSubmitting(true);
    try {
      // Store the OTP for the next step
      setCurrentStep(ResetStep.RESET);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      Alert.alert("Error", "Invalid verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const handleResetPassword = async (data: NewPasswordForm) => {
    setIsSubmitting(true);
    try {
      // Complete the password reset with verification
      await signIn("password", {
        email,
        newPassword: data.password,
        code: verifyForm.getValues().otp,
        flow: "reset-verification",
      });

      Alert.alert("Success", "Your password has been reset successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login"),
        },
      ]);
    } catch (error) {
      console.error("Error resetting password:", error);
      Alert.alert(
        "Error",
        "There was a problem resetting your password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case ResetStep.REQUEST:
        return (
          <>
            <View style={styles.header}>
              <Typography
                variant="2xl"
                weight="semibold"
                style={[styles.title, { color: theme.colors.primary.brand }]}
              >
                Reset Password
              </Typography>
              <Typography
                variant="md"
                style={[styles.subtitle, { color: theme.colors.text }]}
              >
                Enter your email to receive a verification code
              </Typography>
            </View>

            <View style={styles.form}>
              <Controller
                control={requestForm.control}
                name="email"
                render={({
                  field: { onChange, ...rest },
                  fieldState: { error },
                }) => (
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={
                      <Ionicons
                        name="mail"
                        size={20}
                        color={theme.colors.text}
                      />
                    }
                    error={error?.message}
                    {...rest}
                  />
                )}
              />

              <Button
                title="Send Reset Code"
                onPress={requestForm.handleSubmit(handleResetRequest)}
                disabled={isSubmitting}
                loading={isSubmitting}
                style={styles.button}
              />

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Typography
                  variant="sm"
                  style={[styles.backText, { color: theme.colors.text }]}
                >
                  Back to Login
                </Typography>
              </TouchableOpacity>
            </View>
          </>
        );

      case ResetStep.VERIFY:
        return (
          <>
            <View style={styles.header}>
              <Typography
                variant="2xl"
                weight="semibold"
                style={[styles.title, { color: theme.colors.primary.brand }]}
              >
                Verify Code
              </Typography>
              <Typography
                variant="md"
                style={[styles.subtitle, { color: theme.colors.text }]}
              >
                Enter the 8-digit code sent to your email
              </Typography>
            </View>

            <View style={styles.form}>
              <Controller
                control={verifyForm.control}
                name="otp"
                render={({
                  field: { onChange, ...rest },
                  fieldState: { error },
                }) => (
                  <Input
                    label="Verification Code"
                    placeholder="Enter 8-digit code"
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    maxLength={8}
                    leftIcon={
                      <Ionicons
                        name="key"
                        size={20}
                        color={theme.colors.text}
                      />
                    }
                    error={error?.message}
                    {...rest}
                  />
                )}
              />

              <Button
                title="Verify Code"
                onPress={verifyForm.handleSubmit(handleVerifyOTP, (e) => {
                  verifyForm.getValues("otp");
                  console.log("🚀 ~ handleVerifyOTP ~ e:", e);
                })}
                disabled={isSubmitting}
                loading={isSubmitting}
                style={styles.button}
              />

              <TouchableOpacity
                onPress={() => setCurrentStep(ResetStep.REQUEST)}
                style={styles.backButton}
              >
                <Typography
                  variant="sm"
                  style={[styles.backText, { color: theme.colors.text }]}
                >
                  Back to Email
                </Typography>
              </TouchableOpacity>
            </View>
          </>
        );

      case ResetStep.RESET:
        return (
          <>
            <View style={styles.header}>
              <Typography
                variant="2xl"
                weight="semibold"
                style={[styles.title, { color: theme.colors.primary.brand }]}
              >
                Create New Password
              </Typography>
              <Typography
                variant="md"
                style={[styles.subtitle, { color: theme.colors.text }]}
              >
                Enter your new password
              </Typography>
            </View>

            <View style={styles.form}>
              <Controller
                control={resetForm.control}
                name="password"
                render={({
                  field: { onChange, ...rest },
                  fieldState: { error },
                }) => (
                  <Input
                    label="New Password"
                    placeholder="Enter new password"
                    onChangeText={onChange}
                    secureTextEntry
                    leftIcon={
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={theme.colors.text}
                      />
                    }
                    error={error?.message}
                    {...rest}
                  />
                )}
              />

              <Controller
                control={resetForm.control}
                name="confirmPassword"
                render={({
                  field: { onChange, ...rest },
                  fieldState: { error },
                }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    onChangeText={onChange}
                    secureTextEntry
                    leftIcon={
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={theme.colors.text}
                      />
                    }
                    error={error?.message}
                    {...rest}
                  />
                )}
              />

              <Button
                title="Reset Password"
                onPress={resetForm.handleSubmit(handleResetPassword)}
                disabled={isSubmitting}
                loading={isSubmitting}
                style={styles.button}
              />

              <TouchableOpacity
                onPress={() => setCurrentStep(ResetStep.VERIFY)}
                style={styles.backButton}
              >
                <Typography
                  variant="sm"
                  style={[styles.backText, { color: theme.colors.text }]}
                >
                  Back to Verification
                </Typography>
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  form: {
    width: "100%",
  },
  button: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
