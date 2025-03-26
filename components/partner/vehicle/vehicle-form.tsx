import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { ChevronRight, ChevronLeft } from "lucide-react-native";

// Import form types and constants
import {
  vehicleSchema,
  VehicleFormData,
  getDefaultValues,
  VEHICLE_CATEGORIES,
  VEHICLE_FEATURES,
} from "./vehicle-form-types";

// Import form step components
import VehicleDetailsStep from "./form-steps/VehicleDetailsStep";
import CategoryCapacityStep from "./form-steps/CategoryCapacityStep";
import PricingStep from "./form-steps/PricingStep";
import ImagesAndFeaturesStep from "./form-steps/ImagesAndFeaturesStep";
import DocumentsStep from "./form-steps/DocumentsStep";

// Import ProgressSteps component
import ProgressSteps from "./form-components/ProgressSteps";

export const VehicleForm = () => {
  const theme = useTheme();
  const currentUser = useQuery(api.auth.getMe);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registerVehicle = useMutation(api.vehicles.registerVehicle);
  const uploadDocument = useMutation(api.documents.uploadDocument);
  const [currentStep, setCurrentStep] = useState(0);

  const TOTAL_STEPS = 5;
  const STEP_TITLES = [
    "Vehicle Details",
    "Category & Capacity",
    "Pricing",
    "Images & Features",
    "Documents",
  ];

  const userId = currentUser?._id;

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    watch,
    setValue,
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  // Add a function to reset specific fields if they get corrupted
  const resetFieldIfCorrupted = (fieldName: keyof VehicleFormData) => {
    const value = getValues(fieldName);
    const defaultValues = getDefaultValues();

    if (fieldName === "images" || fieldName === "features") {
      if (!Array.isArray(value)) {
        console.error(`Resetting corrupted ${fieldName} field:`, value);
        setValue(fieldName, defaultValues[fieldName]);
        return true;
      }
    }

    return false;
  };

  // Add more comprehensive debugging to the useEffect
  useEffect(() => {
    // Log all form values on every change to help diagnose the issue
    const subscription = watch((formValues) => {
      console.log("Form values changed:", JSON.stringify(formValues, null, 2));

      // Check for type mismatches in critical fields
      if (formValues.images && !Array.isArray(formValues.images)) {
        console.error("Images is not an array:", formValues.images);
        setValue("images", []);
      }

      if (formValues.features && !Array.isArray(formValues.features)) {
        console.error("Features is not an array:", formValues.features);
        setValue("features", []);
      }

      // Check if category value is leaking into other fields
      if (
        formValues.category === "standard" ||
        formValues.category === "premium" ||
        formValues.category === "luxury" ||
        formValues.category === "van"
      ) {
        // Check if any other field has the category value
        Object.entries(formValues).forEach(([key, value]) => {
          if (key !== "category" && value === formValues.category) {
            console.error(`Field ${key} has category value:`, value);

            // Reset the field based on its expected type
            if (key === "images" || key === "features") {
              setValue(key as any, []);
            }
          }
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  // Watch all form values for validation
  const formValues = watch();

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof VehicleFormData)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["brand", "model", "year", "licensePlate", "color"];
        break;
      case 1:
        fieldsToValidate = ["category", "capacity"];
        break;
      case 2:
        fieldsToValidate = ["baseFare", "pricePerKm"];
        break;
      case 3:
        fieldsToValidate = ["features", "images"];
        break;
      case 4:
        fieldsToValidate = [
          "vehicleRegistration",
          "vehicleInsurance",
          "technicalInspection",
        ];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    return isValid;
  };

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();

    if (isValid && currentStep < TOTAL_STEPS - 1) {
      // Force re-validation of form state before changing steps
      const formValues = getValues();

      // Ensure arrays are arrays before proceeding
      if (formValues.images && !Array.isArray(formValues.images)) {
        setValue("images", []);
      }

      if (formValues.features && !Array.isArray(formValues.features)) {
        setValue("features", []);
      }

      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = async (step: number) => {
    // Only allow going to a step if all previous steps are valid
    if (step > currentStep) {
      for (let i = 0; i <= step - 1; i++) {
        setCurrentStep(i);
        const isValid = await validateCurrentStep();
        if (!isValid) return;
      }
    }

    setCurrentStep(step);
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to register a vehicle");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert image strings to storage IDs with null check
      const storageIds =
        data.images?.map((image) => image as unknown as string) || [];

      // Register the vehicle first
      const vehicleId = await registerVehicle({
        ownerId: userId as any,
        brand: data.brand,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        color: data.color,
        capacity: data.capacity,
        images: storageIds as any[],
        pricePerKm: data.pricePerKm,
        baseFare: data.baseFare,
        category: data.category,
        features: data.features || [],
      });

      // Upload documents if provided
      const uploadDocumentPromises = [];

      if (data.vehicleRegistration?.storageId) {
        uploadDocumentPromises.push(
          uploadDocument({
            ownerId: userId,
            vehicleId: vehicleId as any,
            type: "vehicle_registration",
            storageId: data.vehicleRegistration.storageId as any,
            expiryDate: data.vehicleRegistration.expiryDate,
          })
        );
      }

      if (data.vehicleInsurance?.storageId) {
        uploadDocumentPromises.push(
          uploadDocument({
            ownerId: userId,
            vehicleId: vehicleId as any,
            type: "vehicle_insurance",
            storageId: data.vehicleInsurance.storageId as any,
            expiryDate: data.vehicleInsurance.expiryDate,
          })
        );
      }

      if (data.technicalInspection?.storageId) {
        uploadDocumentPromises.push(
          uploadDocument({
            ownerId: userId,
            vehicleId: vehicleId as any,
            type: "vehicle_technical_inspection",
            storageId: data.technicalInspection.storageId as any,
            expiryDate: data.technicalInspection.expiryDate,
          })
        );
      }

      // Wait for all document uploads to complete
      if (uploadDocumentPromises.length > 0) {
        await Promise.all(uploadDocumentPromises);
      }

      Alert.alert("Success", "Vehicle registered successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    // Create a unique key for each step to force React to recreate the components
    const stepKey = `step-${currentStep}`;

    switch (currentStep) {
      case 0:
        return (
          <VehicleDetailsStep
            key={stepKey}
            control={control}
            errors={errors}
            stepTitle={STEP_TITLES[currentStep]}
          />
        );
      case 1:
        return (
          <CategoryCapacityStep
            key={stepKey}
            control={control}
            errors={errors}
            stepTitle={STEP_TITLES[currentStep]}
            vehicleCategories={VEHICLE_CATEGORIES}
          />
        );
      case 2:
        return (
          <PricingStep
            key={stepKey}
            control={control}
            errors={errors}
            stepTitle={STEP_TITLES[currentStep]}
            formValues={formValues}
          />
        );
      case 3:
        return (
          <ImagesAndFeaturesStep
            key={stepKey}
            control={control}
            errors={errors}
            stepTitle={STEP_TITLES[currentStep]}
            getValues={getValues}
            setValue={setValue}
            vehicleFeatures={VEHICLE_FEATURES}
          />
        );
      case 4:
        return (
          <DocumentsStep
            key={stepKey}
            control={control}
            errors={errors}
            stepTitle={STEP_TITLES[currentStep]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Card style={styles.formCard}>
        <ProgressSteps
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onStepPress={goToStep}
        />

        {renderStepContent()}

        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <Button
              title="Back"
              variant="secondary"
              size="md"
              onPress={goToPreviousStep}
              style={styles.backButton}
              leftIcon={
                <ChevronLeft size={18} color={theme.colors.primary.brand} />
              }
            />
          )}

          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              title="Continue"
              variant="primary"
              size="md"
              onPress={goToNextStep}
              style={styles.nextButton}
              rightIcon={<ChevronRight size={18} color="white" />}
            />
          ) : (
            <Button
              title={isSubmitting ? "Registering..." : "Register Vehicle"}
              variant="primary"
              size="md"
              onPress={handleSubmit(onSubmit, (e) => {
                console.log(e);
              })}
              disabled={isSubmitting}
              style={styles.submitButton}
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    padding: 20,
  },
  title: {
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  submitButton: {
    flex: 1,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  backButton: {
    flex: 0.45,
  },
  nextButton: {
    flex: 1,
  },
});

export default VehicleForm;
