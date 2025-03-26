import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { Check } from "lucide-react-native";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  onStepPress: (step: number) => void;
}

export const ProgressSteps = ({
  currentStep,
  totalSteps,
  onStepPress,
}: ProgressStepsProps) => {
  const theme = useTheme();

  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <React.Fragment key={index}>
            <Pressable
              onPress={() => onStepPress(index)}
              style={[
                styles.stepIndicator,
                {
                  backgroundColor:
                    isActive || isCompleted
                      ? theme.colors.primary.brand
                      : theme.colors.gray[200],
                },
              ]}
            >
              {isCompleted ? (
                <Check size={16} color="white" />
              ) : (
                <Typography
                  variant="sm"
                  weight="medium"
                  style={{ color: isActive ? "white" : theme.colors.gray[500] }}
                >
                  {index + 1}
                </Typography>
              )}
            </Pressable>

            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepConnector,
                  {
                    backgroundColor:
                      index < currentStep
                        ? theme.colors.primary.brand
                        : theme.colors.gray[200],
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
});

export default ProgressSteps;
