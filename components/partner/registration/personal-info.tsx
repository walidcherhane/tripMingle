// components/partner/registration/personal-info.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { usePersonalInfoForm } from "@/hooks/useRegistrationForms";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { useRegistrationStep } from "@/hooks/useRegistrationStep";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { Typography } from "@/components/ui/typography";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const PersonalInfo = () => {
  const form = usePersonalInfoForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the current authenticated user
  const currentUser = useQuery(api.auth.getMe);

  // Get the mutation to update partner profile
  const updatePartnerProfile = useMutation(api.users.updatePartnerProfile);

  useFormPersistence(form, "personalInfo");
  const { goToNextStep } = useRegistrationStep(3);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (currentUser) {
      // Set default values from the authenticated user
      if (currentUser.firstName) {
        form.setValue("firstName", currentUser.firstName);
      }
      if (currentUser.lastName) {
        form.setValue("lastName", currentUser.lastName);
      }
      if (currentUser.email) {
        form.setValue("email", currentUser.email);
      }
    }
  }, [currentUser, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    if (!currentUser?._id) {
      console.error("No authenticated user found");
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit personal info data to the server
      await updatePartnerProfile({
        userId: currentUser._id,
        phone: data.phone,
        cin: data.cin,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        profileImage: data.profileImage || undefined,
        cinFrontImage: data.cinFrontImage || undefined,
        cinBackImage: data.cinBackImage || undefined,
        driverLicenseImage: data.driverLicenseImage || undefined,
        languages: [], // Default empty array for languages
      });

      // Then proceed to next step after data is saved
      goToNextStep();
    } catch (error) {
      console.error("Error saving personal info:", error);
    } finally {
      setIsSubmitting(false);
    }
  });

  // Handle file uploads
  const handleProfileImageUpload = (storageId: string, fileUrl: string) => {
    form.setValue("profileImage", { storageId, fileUrl });
  };

  const handleCINFrontUpload = (storageId: string, fileUrl: string) => {
    form.setValue("cinFrontImage", { storageId, fileUrl });
  };

  const handleCINBackUpload = (storageId: string, fileUrl: string) => {
    form.setValue("cinBackImage", { storageId, fileUrl });
  };

  const handleDriverLicenseUpload = (storageId: string, fileUrl: string) => {
    form.setValue("driverLicenseImage", { storageId, fileUrl });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="lg" weight="bold" style={styles.sectionTitle}>
          Complete Your Profile
        </Typography>
        <Typography
          variant="sm"
          color="gray.500"
          style={styles.sectionSubtitle}
        >
          Please provide your personal details
        </Typography>

        {/* Profile Image Upload */}
        <FileUploader
          label="Profile Photo"
          onFileUploaded={handleProfileImageUpload}
          currentFileUrl={form.watch("profileImage")?.fileUrl}
          storageId={form.watch("profileImage")?.storageId}
          onRemove={() => form.setValue("profileImage", null)}
        />

        {/* Personal Information Fields */}
        <View style={styles.row}>
          <View style={styles.flex}>
            <FormField
              control={form.control}
              name="firstName"
              label="First Name"
              placeholder="Enter your first name"
            />
          </View>
          <View style={styles.flex}>
            <FormField
              control={form.control}
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
            />
          </View>
        </View>

        <FormField
          control={form.control}
          name="email"
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
        />

        <FormField
          control={form.control}
          name="phone"
          label="Phone Number"
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />

        <FormField
          control={form.control}
          name="cin"
          label="CIN"
          placeholder="Enter your CIN"
        />

        <FormField
          control={form.control}
          name="address"
          label="Address"
          placeholder="Enter your address"
          multiline
          numberOfLines={3}
        />

        <View style={styles.row}>
          <View style={styles.flex}>
            <FormField
              control={form.control}
              name="city"
              label="City"
              placeholder="Enter your city"
            />
          </View>
          <View style={styles.flex}>
            <FormField
              control={form.control}
              name="postalCode"
              label="Postal Code"
              placeholder="Enter postal code"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Document Uploads */}
        <View style={styles.documents}>
          <FileUploader
            label="CIN Front"
            onFileUploaded={handleCINFrontUpload}
            currentFileUrl={form.watch("cinFrontImage")?.fileUrl}
            storageId={form.watch("cinFrontImage")?.storageId}
            onRemove={() => form.setValue("cinFrontImage", null)}
          />

          <FileUploader
            label="CIN Back"
            onFileUploaded={handleCINBackUpload}
            currentFileUrl={form.watch("cinBackImage")?.fileUrl}
            storageId={form.watch("cinBackImage")?.storageId}
            onRemove={() => form.setValue("cinBackImage", null)}
          />

          <FileUploader
            label="Driver's License"
            onFileUploaded={handleDriverLicenseUpload}
            currentFileUrl={form.watch("driverLicenseImage")?.fileUrl}
            storageId={form.watch("driverLicenseImage")?.storageId}
            onRemove={() => form.setValue("driverLicenseImage", null)}
          />
        </View>

        <Button
          title="Save & Continue"
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
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
  sectionTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  sectionSubtitle: {
    marginBottom: 24,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  documents: {
    marginVertical: 16,
  },
});

export default PersonalInfo;
