import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Controller } from "react-hook-form";
import { AlertCircle } from "lucide-react-native";
import { useAuthorizationForm } from "@/hooks/useRegistrationForms";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { useRegistrationStep } from "@/hooks/useRegistrationStep";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router } from "expo-router";
import { Typography } from "@/components/ui/typography";
import Checkbox from "@/components/ui/checkbox";
import FormError from "@/components/form/form-error";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";

const Authorization = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useAuthorizationForm();

  // Get the current authenticated user
  const currentUser = useQuery(api.auth.getMe);

  // Get the mutation to update partner profile
  const updatePartnerProfile = useMutation(api.users.updatePartnerProfile);

  useFormPersistence(form, "authorizationInfo");

  const { goToPreviousStep, isLastStep } = useRegistrationStep(3);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!currentUser?._id) {
      console.error("No authenticated user found");
      return;
    }

    try {
      setIsSubmitting(true);

      // Update partner profile with tourism license
      await updatePartnerProfile({
        userId: currentUser._id,
        tourismLicenseImage: data.tourismLicenseImage || undefined,
      });

      // Navigate to success page
      router.push("/partner/registration-success");
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Tourism License */}
        <View style={styles.section}>
          <Typography variant="lg" weight="bold" style={styles.title}>
            Tourism Authorization
          </Typography>
          <Typography variant="sm" style={styles.description}>
            Please upload your government-issued tourism transport authorization
            document ("Transport Touristique"). This document is mandatory for
            account approval.
          </Typography>

          <FileUploader
            label="Tourism License"
            onFileUploaded={(storageId, fileUrl) =>
              form.setValue("tourismLicenseImage", { storageId, fileUrl })
            }
            currentFileUrl={form.watch("tourismLicenseImage")?.fileUrl}
            storageId={form.watch("tourismLicenseImage")?.storageId}
            onRemove={() => form.setValue("tourismLicenseImage", null)}
          />
        </View>

        {/* Verification Process Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <AlertCircle size={20} color="#3B82F6" />
            <Typography weight="medium" style={styles.infoTitle}>
              Verification Process
            </Typography>
          </View>
          <Typography variant="sm" style={styles.infoText}>
            Your documents will be manually reviewed by our team. This process
            typically takes up to 48 hours. You'll receive an email notification
            once your account is verified and activated.
          </Typography>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <Controller
            control={form.control}
            name="termsAccepted"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.checkboxContainer}>
                <View style={styles.row}>
                  <Checkbox checked={value} onPress={() => onChange(!value)} />
                  <Typography variant="sm" style={styles.checkboxLabel}>
                    I confirm that all provided information and documents are
                    authentic and valid
                  </Typography>
                </View>
                <FormError error={error} />
              </View>
            )}
          />

          <Controller
            control={form.control}
            name="privacyAccepted"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View style={styles.checkboxContainer}>
                <View style={styles.row}>
                  <Checkbox checked={value} onPress={() => onChange(!value)} />
                  <Typography variant="sm" style={styles.checkboxLabel}>
                    I agree to the terms of service and privacy policy
                  </Typography>
                </View>
                <FormError error={error} />
              </View>
            )}
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
            title="Submit"
            onPress={onSubmit}
            disabled={!form.formState.isValid}
            loading={isSubmitting}
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
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoTitle: {
    marginLeft: 8,
  },
  infoText: {
    color: "#374151",
    lineHeight: 20,
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkboxLabel: {
    color: "#374151",
    marginLeft: 12,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Authorization;
