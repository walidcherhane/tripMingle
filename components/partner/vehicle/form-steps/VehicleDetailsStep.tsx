import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { VehicleFormData } from "../vehicle-form-types";
import { CustomFormField } from "../form-components/CustomFormField";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface VehicleDetailsStepProps {
  control: Control<VehicleFormData>;
  errors: FieldErrors<VehicleFormData>;
  stepTitle: string;
}

export const VehicleDetailsStep = ({
  control,
  errors,
  stepTitle,
}: VehicleDetailsStepProps) => {
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
        name="brand"
        render={({ field: { onChange, value } }) => (
          <CustomFormField
            label="Brand"
            placeholder="e.g. Toyota, BMW, Mercedes"
            value={value}
            onChangeText={onChange}
            error={errors.brand?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="model"
        render={({ field: { onChange, value } }) => (
          <CustomFormField
            label="Model"
            placeholder="e.g. Camry, X5, C-Class"
            value={value}
            onChangeText={onChange}
            error={errors.model?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="year"
        render={({ field: { onChange, value } }) => (
          <CustomFormField
            label="Year"
            placeholder="e.g. 2022"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            error={errors.year?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="licensePlate"
        render={({ field: { onChange, value } }) => (
          <CustomFormField
            label="License Plate"
            placeholder="e.g. ABC-123"
            value={value}
            onChangeText={onChange}
            error={errors.licensePlate?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="color"
        render={({ field: { onChange, value } }) => (
          <CustomFormField
            label="Color"
            placeholder="e.g. Black, White, Silver"
            value={value}
            onChangeText={onChange}
            error={errors.color?.message}
          />
        )}
      />
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
});

export default VehicleDetailsStep;
