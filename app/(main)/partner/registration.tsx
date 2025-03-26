// app/screens/registration/VehicleOwnerRegistration.tsx
import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { Stack, router } from "expo-router";
import { useRegistrationStep } from "@/hooks/useRegistrationStep";
import StepIndicator from "@/components/ui/step-indicator";
import PersonalInfo from "@/components/partner/registration/personal-info";
import VehicleInfo from "@/components/partner/registration/vehicle-info";
import Authorization from "@/components/partner/registration/authorization";
import { theme } from "@/theme";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react-native";

const STEPS = [
  {
    id: "personal",
    title: "Personal Info",
  },
  {
    id: "vehicle",
    title: "Vehicle Info",
  },
  {
    id: "authorization",
    title: "Authorization",
  },
] as const;

const Registration = () => {
  const { currentStep } = useRegistrationStep(STEPS.length);
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuthActions();

  // Get the current user directly without using the routing hook
  // This prevents redirection loops
  const currentUser = useQuery(api.auth.getMe);

  // Once we have user data, we can stop loading
  if (currentUser && loading) {
    setLoading(false);
  }

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Show loading indicator while we check auth status
  if (loading || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.brand} />
      </View>
    );
  }

  // Render the appropriate step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfo />;
      case 1:
        return <VehicleInfo />;
      case 2:
        return <Authorization />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Partner Registration",
          headerBackVisible: currentStep > 0,
          headerRight: () => (
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color={theme.colors.gray[600]} />
            </Pressable>
          ),
        }}
      />

      <StepIndicator
        steps={STEPS.map((step) => step.title)}
        currentStep={currentStep}
      />

      <View style={styles.content}>{renderStep()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  logoutButton: {
    padding: 8,
  },
});

export default Registration;
