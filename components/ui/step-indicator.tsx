// @/screens/registration/components/StepIndicator.tsx
import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { UserCircle, Car, FileCheck } from "lucide-react-native";
import { Typography } from "./typography";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useTheme } from "@/hooks/useTheme";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  const { colors } = useTheme();
  // Get the appropriate icon for each step
  const getStepIcon = (index: number) => {
    switch (index) {
      case 0:
        return UserCircle;
      case 1:
        return Car;
      case 2:
        return FileCheck;
      default:
        return UserCircle;
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicators */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const StepIcon = getStepIcon(index);
          const isCompleted = index <= currentStep;
          const isActive = index === currentStep;

          return (
            <View key={step} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCompleted,
                  isActive && styles.stepActive,
                ]}
              >
                <StepIcon
                  size={20}
                  color={
                    isCompleted || isActive
                      ? colors.primary.lightest
                      : colors.primary.light
                  }
                />
              </View>
              <Typography
                variant="sm"
                color={isCompleted || isActive ? "primary.brand" : "text"}
                weight={isActive ? "semibold" : "normal"}
              >
                {step}
              </Typography>
            </View>
          );
        })}
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressBarContainer,
          {
            backgroundColor: colors.border,
          },
        ]}
      >
        <View style={styles.progressBackground} />
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressBarContainer: {
    height: 2,
    marginTop: spacing.md,
    position: "relative",
  },
  progressBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "#E5E7EB",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    height: "100%",
    backgroundColor: colors.primary.brand,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepWrapper: {
    flex: 1,
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  stepCompleted: {
    backgroundColor: colors.primary.brand,
  },
  stepActive: {
    backgroundColor: colors.primary.brand,
  },
  stepLabel: {
    fontSize: 12,

    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  stepLabelActive: {
    color: colors.primary.brand,
    fontWeight: "500",
  },
});

export default StepIndicator;
