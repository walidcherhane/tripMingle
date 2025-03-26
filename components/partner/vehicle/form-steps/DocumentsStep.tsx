import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { VehicleFormData } from "../vehicle-form-types";
import { DocumentUploader } from "../form-components/DocumentUploader";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface DocumentsStepProps {
  control: Control<VehicleFormData>;
  errors: FieldErrors<VehicleFormData>;
  stepTitle: string;
}

export const DocumentsStep = ({
  control,
  errors,
  stepTitle,
}: DocumentsStepProps) => {
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
        style={{ color: theme.colors.gray[600], marginBottom: 16 }}
      >
        Please upload the required documents for your vehicle. These documents
        will be verified by our team.
      </Typography>

      <Controller
        control={control}
        name="vehicleRegistration"
        render={({ field: { onChange, value } }) => (
          <DocumentUploader
            label="Vehicle Registration (Carte Grise)"
            value={value}
            onChange={onChange}
            error={errors.vehicleRegistration?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="vehicleInsurance"
        render={({ field: { onChange, value } }) => (
          <DocumentUploader
            label="Vehicle Insurance"
            value={value}
            onChange={onChange}
            error={errors.vehicleInsurance?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="technicalInspection"
        render={({ field: { onChange, value } }) => (
          <DocumentUploader
            label="Technical Inspection"
            value={value}
            onChange={onChange}
            error={errors.technicalInspection?.message}
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

export default DocumentsStep;
