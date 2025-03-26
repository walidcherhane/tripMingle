// app/components/form/FormAvatarPicker.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { UserCircle, Camera, X } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { Typography } from "../ui/typography";
import FormError from "./form-error";

interface FormAvatarPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  size?: number;
  required?: boolean;
}

export function FormAvatarPicker<T extends FieldValues>({
  control,
  name,
  label,
  size = 120,
  required = false,
}: FormAvatarPickerProps<T>) {
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      return null;
    } catch (error) {
      console.error("Error picking image:", error);
      return null;
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required }}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        console.log("🚀 ~ value:", value);
        return (
          <View style={styles.container}>
            {label && <Typography variant="sm">{label}</Typography>}

            <View style={styles.avatarContainer}>
              <TouchableOpacity
                style={[
                  styles.avatarButton,
                  { width: size, height: size, borderRadius: size / 2 },
                  error && styles.avatarError,
                ]}
                onPress={async () => {
                  const result = await pickImage();
                  if (result) {
                    onChange(result);
                  }
                }}
              >
                {value ? (
                  <View
                    style={[styles.imageContainer, { borderRadius: size / 2 }]}
                  >
                    <Image
                      source={{ uri: value.uri ?? value }}
                      style={[styles.image, { borderRadius: size / 2 }]}
                    />
                    <View style={styles.overlay}>
                      <Camera size={24} color="#FFFFFF" />
                    </View>
                  </View>
                ) : (
                  <View style={styles.placeholderContainer}>
                    <UserCircle size={size * 0.3} color={colors.gray[300]} />
                    <Typography variant="sm">Add Photo</Typography>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <FormError error={error} />
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  avatarContainer: {
    alignItems: "center",
  },
  avatarButton: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  avatarError: {
    borderColor: "#EF4444",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    opacity: 0,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
