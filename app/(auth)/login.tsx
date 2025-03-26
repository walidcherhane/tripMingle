import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, usePathname } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { useLoginForm } from "@/hooks/useAuthForms";
import { useAuthActions } from "@convex-dev/auth/react";
import { LoginForm } from "@/lib/schemas/auth";
import { Controller } from "react-hook-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { routeUser, UserProfile } from "@/utils/routingUtils";
import { Typography } from "@/components/ui/typography";

const LoginScreen = () => {
  const { signIn } = useAuthActions();
  const [rememberMe, setRememberMe] = useState(false);
  const currentUser = useQuery(api.auth.getMe);
  const pathname = usePathname();

  // Route authenticated users
  useEffect(() => {
    if (currentUser) {
      // Route the user based on their status
      routeUser(currentUser, pathname);
    }
  }, [currentUser, pathname]);

  // Initialize login form
  const loginForm = useLoginForm();

  const handleLogin = async (data: LoginForm) => {
    void signIn("password", {
      email: data.email,
      password: data.password,
      flow: "signIn",
    });
    // No need to redirect here, the useEffect above will handle it
  };

  const handleGoogleSignIn = () => {
    // Implement Google sign-in logic
    console.log("Google sign-in");
  };

  const handleForgotPassword = () => {
    // Route to the reset password page
    router.push("/(auth)/reset-password");
  };

  const handleRegister = () => {
    router.push("/(auth)/account-type");
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
        <View style={styles.logoContainer}>
          {/* Replace with your actual logo */}
          {/* <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          /> */}
        </View>

        <View style={styles.header}>
          <Typography
            style={[styles.title, { color: theme.colors.primary.brand }]}
          >
            Welcome Back
          </Typography>
          <Typography style={[styles.subtitle, { color: theme.colors.text }]}>
            Sign in to your account
          </Typography>
        </View>

        <View style={styles.form}>
          <Controller
            control={loginForm.control}
            name="email"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <Ionicons name="mail" size={20} color={theme.colors.text} />
                }
                error={error?.message}
              />
            )}
          />

          <Controller
            control={loginForm.control}
            name="password"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="default"
                secureTextEntry
                leftIcon={
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={theme.colors.text}
                  />
                }
                error={error?.message}
              />
            )}
          />

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe && {
                    backgroundColor: theme.colors.primary.brand,
                    borderColor: theme.colors.primary.brand,
                  },
                ]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Typography
                style={[styles.rememberMeText, { color: theme.colors.text }]}
              >
                Remember me
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword}>
              <Typography
                style={[
                  styles.forgotPasswordText,
                  { color: theme.colors.primary.brand },
                ]}
              >
                Forgot Password?
              </Typography>
            </TouchableOpacity>
          </View>

          <Button
            title="Sign In"
            onPress={loginForm.handleSubmit(handleLogin)}
            disabled={loginForm.formState.isSubmitting}
            loading={loginForm.formState.isSubmitting}
            style={styles.loginButton}
          />

          <View style={styles.dividerContainer}>
            <View
              style={[styles.divider, { backgroundColor: theme.colors.border }]}
            />
            <Typography
              style={[styles.dividerText, { color: theme.colors.text }]}
            >
              OR
            </Typography>
            <View
              style={[styles.divider, { backgroundColor: theme.colors.border }]}
            />
          </View>

          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="secondary"
            style={styles.googleButton}
            leftIcon={
              <Ionicons
                name="logo-google"
                size={20}
                color={theme.colors.text}
              />
            }
          />

          <View style={styles.registerContainer}>
            <Typography
              style={[styles.registerText, { color: theme.colors.text }]}
            >
              Don't have an account?
            </Typography>
            <TouchableOpacity onPress={handleRegister}>
              <Typography
                style={[
                  styles.registerLink,
                  { color: theme.colors.primary.brand },
                ]}
              >
                {" Register"}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  header: {
    marginBottom: 24,
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
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primary.brand,
    borderColor: theme.colors.primary.brand,
  },
  tabText: {
    fontWeight: "600",
    fontSize: 15,
  },
  form: {
    width: "100%",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  googleButton: {
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  registerText: {
    fontSize: 15,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: "600",
  },
});

export default LoginScreen;
