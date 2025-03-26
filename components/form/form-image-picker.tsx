// app/components/form/FormImagePicker.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { Camera, X, Plus } from "lucide-react-native";
import { Typography } from "@/components/ui/typography";

interface ImageInfo {
  uri: string;
  type?: string;
  name?: string;
}

interface FormImagePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  multiple?: boolean;
  required?: boolean;
  maxImages?: number;
}

export function FormImagePicker<T extends FieldValues>({
  control,
  name,
  label,
  multiple = false,
  required = false,
  maxImages = 10,
  placeholder,
}: FormImagePickerProps<T>) {
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: !multiple,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: multiple,
        selectionLimit: maxImages,
      });

      if (!result.canceled) {
        return multiple ? result.assets : result.assets[0];
      }
      return null;
    } catch (error) {
      console.error("Error picking image:", error);
      return null;
    }
  };

  const removeImage = (images: ImageInfo[], indexToRemove: number) => {
    return images.filter((_, index) => index !== indexToRemove);
  };

  const renderSingleImagePicker = (
    value: ImageInfo | null,
    onChange: (value: ImageInfo | null) => void,
    error?: any
  ) => (
    <TouchableOpacity
      style={[styles.pickerContainer, error && styles.errorBorder]}
      onPress={async () => {
        const result = await pickImage();
        if (result) {
          if (Array.isArray(result)) {
            onChange(result[0]);
          } else {
            onChange(result);
          }
        }
      }}
    >
      {value ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: value.uri }} style={styles.singleImage} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onChange(null)}
          >
            <X size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Camera size={24} color="#9CA3AF" />
          <Typography style={styles.placeholderText}>
            {placeholder || "Tap to select an image"}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMultipleImagePicker = (
    values: ImageInfo[],
    onChange: (value: ImageInfo[]) => void,
    error?: any
  ) => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {values.map((image, index) => (
          <View key={index} style={styles.multipleImageContainer}>
            <Image source={{ uri: image.uri }} style={styles.multipleImage} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onChange(removeImage(values, index))}
            >
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}

        {values.length < maxImages && (
          <TouchableOpacity
            style={[styles.addMoreButton, error && styles.errorBorder]}
            onPress={async () => {
              const result = await pickImage();
              if (result) {
                onChange([
                  ...values,
                  ...(Array.isArray(result) ? result : [result]),
                ]);
              }
            }}
          >
            <Plus size={24} color="#9CA3AF" />
            <Typography style={styles.addMoreText}>
              {placeholder || "Add Photos"}
            </Typography>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Typography style={styles.label}>{label}</Typography>

          {multiple
            ? renderMultipleImagePicker(value || [], onChange, error)
            : renderSingleImagePicker(value, onChange, error)}

          {error && (
            <Typography style={styles.errorText}>
              {error.message || "This field is required"}
            </Typography>
          )}
        </View>
      )}
    />
  );
}

const { width } = Dimensions.get("window");
const imageSize = (width - 72) / 3; // 3 images per row with padding

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  pickerContainer: {
    height: 200,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
    overflow: "hidden",
  },
  errorBorder: {
    borderColor: "#EF4444",
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  singleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
  },
  scrollContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  multipleImageContainer: {
    position: "relative",
    width: imageSize,
    height: imageSize,
    borderRadius: 8,
    overflow: "hidden",
  },
  multipleImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  addMoreButton: {
    width: imageSize,
    height: imageSize,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 12,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
});
