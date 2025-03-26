import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as ImagePicker from "expo-image-picker";
import { Camera, Upload, User } from "lucide-react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

export default function PersonalInfoScreen() {
  const theme = useTheme();
  const currentUser = useQuery(api.auth.getMe);
  const updateUser = useMutation(api.users.updateUser);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
    },
  });

  const onSubmit = async (data: PersonalInfoForm) => {
    try {
      await updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });
      Alert.alert("Success", "Your profile has been updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
      console.error(error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error(error);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Prepare the image file
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Convex Storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        body: blob,
        headers: {
          "Content-Type": blob.type || "application/octet-stream",
        },
      });

      if (!result.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await result.json();

      // Update user profile with new image
      await updateUser({
        profileImage: storageId,
      });

      Alert.alert("Success", "Profile picture updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to upload image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.brand} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primary.lightest },
              ]}
            >
              {currentUser?.profileImage ? (
                <Image
                  source={{ uri: currentUser.profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Typography
                  variant="2xl"
                  style={{ color: theme.colors.primary.brand }}
                >
                  {currentUser?.firstName?.charAt(0)}
                  {currentUser?.lastName?.charAt(0)}
                </Typography>
              )}
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="white" />
                </View>
              )}
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.changePhotoButton,
              pressed && styles.pressed,
              { backgroundColor: theme.colors.primary.lightest },
            ]}
            onPress={handleImagePick}
            disabled={isUploading}
          >
            <Upload size={16} color={theme.colors.primary.brand} />
            <Typography
              variant="sm"
              weight="medium"
              style={{
                marginLeft: 8,
                color: theme.colors.primary.brand,
              }}
            >
              Change Photo
            </Typography>
          </Pressable>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="First Name"
                placeholder="Enter your first name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.firstName?.message}
                containerStyle={styles.inputContainer}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Last Name"
                placeholder="Enter your last name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.lastName?.message}
                containerStyle={styles.inputContainer}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.email?.message}
                containerStyle={styles.inputContainer}
                editable={false}
                helperText="Email cannot be changed"
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.phone?.message}
                containerStyle={styles.inputContainer}
                keyboardType="phone-pad"
              />
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            style={styles.saveButton}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  card: {
    margin: 16,
  },
  imageSection: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.7,
  },
  formSection: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});
