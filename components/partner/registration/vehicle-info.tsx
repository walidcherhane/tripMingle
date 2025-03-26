// components/partner/registration/vehicle-info.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { useVehicleInfoForm } from "@/hooks/useRegistrationForms";
import { useRegistrationStep } from "@/hooks/useRegistrationStep";
import { FileUploader } from "@/components/ui/file-uploader";
import { MultipleFileUploader } from "@/components/ui/multiple-file-uploader";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const VehicleInfo = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useVehicleInfoForm();
  useFormPersistence(form, "vehicleInfo");
  const { goToNextStep, goToPreviousStep } = useRegistrationStep(3);

  // Get the current authenticated user
  const currentUser = useQuery(api.auth.getMe);

  // Get the mutation to register vehicle
  const registerVehicle = useMutation(api.vehicles.registerVehicle);

  const onSubmit = form.handleSubmit(
    async (data) => {
      if (!currentUser?._id) {
        console.error("No authenticated user found");
        return;
      }

      try {
        setIsSubmitting(true);

        // Register the vehicle with the server
        await registerVehicle({
          ownerId: currentUser._id,
          brand: data.brand,
          model: data.model,
          year: data.year,
          licensePlate: data.licensePlate,
          color: data.color || "Not specified",
          capacity: parseInt(data.capacity),
          images: data.vehicleImages,
          pricePerKm: parseFloat(data.pricePerKm),
          baseFare: 0, // Default value
          category: data.category || "standard",
          features: [], // Default empty array for features
        });

        // Then proceed to next step after data is saved
        goToNextStep();
      } catch (error) {
        console.error("Error saving vehicle info:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    (e) => {
      console.log("ERROR", e);
    }
  );

  // Handle file uploads
  const handleVehicleImagesUpdate = (
    files: { storageId: string; fileUrl?: string }[]
  ) => {
    form.setValue("vehicleImages", files);
  };

  const handleCarteGriseUpload = (storageId: string, fileUrl: string) => {
    form.setValue("carteGriseImage", { storageId, fileUrl });
  };

  const handleInsuranceUpload = (storageId: string, fileUrl: string) => {
    form.setValue("insuranceImage", { storageId, fileUrl });
  };

  const handleTechnicalInspectionUpload = (
    storageId: string,
    fileUrl: string
  ) => {
    form.setValue("technicalInspectionImage", { storageId, fileUrl });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Basic Vehicle Information */}
        <View style={styles.section}>
          <FormField
            control={form.control}
            name="brand"
            label="Brand"
            placeholder="e.g., Mercedes, Toyota"
          />

          <FormField
            control={form.control}
            name="model"
            label="Model"
            placeholder="Vehicle model"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <FormField
                control={form.control}
                name="year"
                label="Year"
                placeholder="YYYY"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <FormField
                control={form.control}
                name="capacity"
                label="Passenger Capacity"
                placeholder="Number of seats"
                keyboardType="numeric"
              />
            </View>
          </View>

          <FormField
            control={form.control}
            name="licensePlate"
            label="License Plate Number"
            placeholder="XXXXX | X | XX"
          />
          <FormField
            control={form.control}
            name="pricePerKm"
            label="Price per KM"
            placeholder="Price per KM"
          />
        </View>

        {/* Vehicle Photos */}
        <View style={styles.section}>
          <MultipleFileUploader
            label="Vehicle Photos"
            files={form.watch("vehicleImages") || []}
            onFilesUpdated={handleVehicleImagesUpdate}
            maxFiles={5}
          />
        </View>

        {/* Required Documents */}
        <View style={styles.section}>
          <FileUploader
            label="Carte Grise"
            onFileUploaded={handleCarteGriseUpload}
            currentFileUrl={form.watch("carteGriseImage")?.fileUrl}
            storageId={form.watch("carteGriseImage")?.storageId}
            onRemove={() => form.setValue("carteGriseImage", null)}
          />

          <FileUploader
            label="Insurance Document"
            onFileUploaded={handleInsuranceUpload}
            currentFileUrl={form.watch("insuranceImage")?.fileUrl}
            storageId={form.watch("insuranceImage")?.storageId}
            onRemove={() => form.setValue("insuranceImage", null)}
          />

          <FileUploader
            label="Technical Inspection"
            onFileUploaded={handleTechnicalInspectionUpload}
            currentFileUrl={form.watch("technicalInspectionImage")?.fileUrl}
            storageId={form.watch("technicalInspectionImage")?.storageId}
            onRemove={() => form.setValue("technicalInspectionImage", null)}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={goToPreviousStep}
            variant="secondary"
            style={styles.button}
          />
          <Button
            title="Save & Continue"
            onPress={onSubmit}
            loading={isSubmitting}
            disabled={!form.formState.isValid || isSubmitting}
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
});

export default VehicleInfo;
