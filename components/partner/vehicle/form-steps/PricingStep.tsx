import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import {
  Controller,
  Control,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import { VehicleFormData } from "../vehicle-form-types";
import { CustomFormField } from "../form-components/CustomFormField";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface PricingStepProps {
  control: Control<VehicleFormData>;
  errors: FieldErrors<VehicleFormData>;
  stepTitle: string;
  formValues: VehicleFormData;
}

export const PricingStep = ({
  control,
  errors,
  stepTitle,
  formValues,
}: PricingStepProps) => {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={styles.stepContent}
    >
      <Typography
        variant="lg"
        weight="semibold"
        style={[styles.stepTitle, { color: theme.colors.text }]}
      >
        {stepTitle}
      </Typography>

      <Controller
        control={control}
        name="baseFare"
        render={({ field: { onChange, value } }) => (
          <CustomFormField
            label="Base Fare (MAD)"
            placeholder="e.g. 50"
            value={value?.toString() || "0"}
            onChangeText={(text: string) => onChange(parseFloat(text) || 0)}
            keyboardType="numeric"
            error={errors.baseFare?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="pricePerKm"
        render={({ field: { onChange, value } }) => (
          <CustomFormField
            label="Price per Kilometer (MAD)"
            placeholder="e.g. 2.5"
            value={value?.toString() || "0"}
            onChangeText={(text: string) => onChange(parseFloat(text) || 0)}
            keyboardType="numeric"
            error={errors.pricePerKm?.message}
          />
        )}
      />

      <View style={styles.pricingInfo}>
        <Typography variant="sm" style={{ color: theme.colors.gray[600] }}>
          Example trip calculation:
        </Typography>
        <Typography
          variant="md"
          weight="medium"
          style={{ color: theme.colors.text, marginTop: 8 }}
        >
          10 km trip ={" "}
          {(formValues.baseFare || 0) + (formValues.pricePerKm || 0) * 10} MAD
        </Typography>
        <Typography
          variant="xs"
          style={{ color: theme.colors.gray[500], marginTop: 4 }}
        >
          ({formValues.baseFare || 0} MAD base fare +{" "}
          {formValues.pricePerKm || 0} MAD × 10 km)
        </Typography>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  stepContent: {
    marginBottom: 24,
  },
  stepTitle: {
    marginBottom: 20,
  },
  pricingInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});

export default PricingStep;
