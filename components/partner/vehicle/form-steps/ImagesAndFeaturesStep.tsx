import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import {
  Controller,
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { VehicleFormData } from "../vehicle-form-types";
import { FeatureSelector } from "../form-components/FeatureSelector";
import VehicleImageUploader from "../vehicle-image-uploader";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface ImagesAndFeaturesStepProps {
  control: Control<VehicleFormData>;
  errors: FieldErrors<VehicleFormData>;
  stepTitle: string;
  getValues: UseFormGetValues<VehicleFormData>;
  setValue: UseFormSetValue<VehicleFormData>;
  vehicleFeatures: Array<{ label: string; value: string }>;
}

export const ImagesAndFeaturesStep = ({
  control,
  errors,
  stepTitle,
  getValues,
  setValue,
  vehicleFeatures,
}: ImagesAndFeaturesStepProps) => {
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
        style={[styles.formFieldLabel, { marginBottom: 8 }]}
      >
        Vehicle Images
      </Typography>

      <Controller
        control={control}
        name="images"
        render={({ field }) => {
          // Ensure value is always an array
          const safeValue = Array.isArray(field.value) ? field.value : [];

          return (
            <VehicleImageUploader
              images={safeValue}
              onImagesChange={(newImages) => {
                // Explicitly set only the images field
                field.onChange(newImages);

                // Double-check the value was set correctly
                setTimeout(() => {
                  const currentValue = getValues("images");
                  if (!Array.isArray(currentValue)) {
                    console.error(
                      "Images still not an array after update:",
                      currentValue
                    );
                    setValue("images", newImages);
                  }
                }, 0);
              }}
              maxImages={5}
              error={errors.images?.message}
            />
          );
        }}
      />

      <Typography
        variant="sm"
        style={[styles.formFieldLabel, { marginBottom: 8, marginTop: 16 }]}
      >
        Vehicle Features
      </Typography>

      <Controller
        control={control}
        name="features"
        render={({ field }) => {
          // Ensure value is always an array
          const safeValue = Array.isArray(field.value) ? field.value : [];

          return (
            <FeatureSelector
              value={safeValue}
              onChange={(newFeatures) => {
                // Explicitly set only the features field
                field.onChange(newFeatures);

                // Double-check the value was set correctly
                setTimeout(() => {
                  const currentValue = getValues("features");
                  if (!Array.isArray(currentValue)) {
                    console.error(
                      "Features still not an array after update:",
                      currentValue
                    );
                    setValue("features", newFeatures);
                  }
                }, 0);
              }}
              options={vehicleFeatures}
              error={errors.features?.message}
            />
          );
        }}
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

export default ImagesAndFeaturesStep;
