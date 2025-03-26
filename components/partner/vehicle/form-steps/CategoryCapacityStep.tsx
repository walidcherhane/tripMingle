import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { VehicleFormData } from "../vehicle-form-types";
import { CustomFormField } from "../form-components/CustomFormField";
import { CategorySelector } from "../form-components/CategorySelector";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface CategoryCapacityStepProps {
  control: Control<VehicleFormData>;
  errors: FieldErrors<VehicleFormData>;
  stepTitle: string;
  vehicleCategories: Array<{ label: string; value: string }>;
}

export const CategoryCapacityStep = ({
  control,
  errors,
  stepTitle,
  vehicleCategories,
}: CategoryCapacityStepProps) => {
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

      <Typography
        variant="sm"
        style={[styles.formFieldLabel, { marginBottom: 16 }]}
      >
        Vehicle Category
      </Typography>

      <Controller
        control={control}
        name="category"
        render={({ field: { onChange, value } }) => (
          <CategorySelector
            value={value}
            onChange={(newValue) => {
              // Explicitly set only the category field
              onChange(newValue);
            }}
            options={vehicleCategories}
            error={errors.category?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="capacity"
        render={({ field: { onChange, value } }) => (
          <CustomFormField
            label="Passenger Capacity"
            placeholder="e.g. 4"
            value={value?.toString() || "4"}
            onChangeText={(text: string) => onChange(parseInt(text) || 0)}
            keyboardType="numeric"
            error={errors.capacity?.message}
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
  formFieldLabel: {
    marginBottom: 8,
    fontWeight: "500",
  },
});

export default CategoryCapacityStep;
