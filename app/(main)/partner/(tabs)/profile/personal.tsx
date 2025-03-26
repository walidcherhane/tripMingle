// app/(main)/partner/profile/personal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { Stack, router } from "expo-router";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormAvatarPicker } from "@/components/form/form-avatar-picker";
import { FormField } from "@/components/form/form-field";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Id } from "@/convex/_generated/dataModel";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^(?:\+212|0)[567]\d{8}$/, "Invalid Moroccan phone number"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  profileImage: z.any().optional(),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

export default function PersonalInformationScreen() {
  const theme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarStorageId, setAvatarStorageId] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  // Fetch current user data
  const currentUser = useQuery(api.auth.getMe);

  // Get the update profile mutation
  const updateProfile = useMutation(api.users.updateUserProfile);

  // Get the generate upload URL mutation
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  const form = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
    },
  });

  // Update form with current user data when available
  useEffect(() => {
    if (currentUser) {
      const profileImageUrl = currentUser.profileImage;
      setOriginalImage(profileImageUrl || null);

      form.reset({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        city: currentUser.city || "",
        profileImage: currentUser.profileImage || null,
      });
    }
  }, [currentUser, form]);

  // Handle avatar upload
  const handleAvatarUpload = async (
    imageAsset: ImagePicker.ImagePickerAsset
  ) => {
    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      const fileResponse = await fetch(imageAsset.uri);
      const fileBlob = await fileResponse.blob();

      // Upload the image
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": imageAsset.mimeType || "image/jpeg",
        },
        body: fileBlob,
      });

      const { storageId } = await response.json();
      setAvatarStorageId(storageId);
      return storageId;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      Alert.alert(
        "Upload Failed",
        "Failed to upload profile image. Please try again."
      );
      return null;
    }
  };

  const onSubmit = async (data: PersonalInfoForm) => {
    if (!currentUser?._id) {
      Alert.alert("Error", "User information not available");
      return;
    }

    setIsSubmitting(true);
    try {
      // Handle avatar upload if selected
      let profileImage = currentUser.profileImage;
      if (data.profileImage) {
        const storageId = await handleAvatarUpload(data.profileImage);
        if (storageId) {
          profileImage = storageId;
        }
      }

      // Update profile in Convex
      await updateProfile({
        userId: currentUser._id,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        profileImage: profileImage as Id<"_storage">,
      });

      Alert.alert("Success", "Profile updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Update Failed",
        "Failed to update profile. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Personal Information",
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.avatarContainer}>
            <FormAvatarPicker
              control={form.control}
              name="profileImage"
              size={120}
            />
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <FormField
                  control={form.control}
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                />
              </View>
              <View style={styles.halfWidth}>
                <FormField
                  control={form.control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                />
              </View>
            </View>

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter email"
              keyboardType="email-address"
            />

            <FormField
              control={form.control}
              name="phone"
              label="Phone Number"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <FormField
              control={form.control}
              name="address"
              label="Address"
              placeholder="Enter address"
              multiline
              numberOfLines={3}
            />

            <FormField
              control={form.control}
              name="city"
              label="City"
              placeholder="Enter city"
            />

            <Button
              title="Save Changes"
              onPress={form.handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    marginTop: 24,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  removeIconButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
});
