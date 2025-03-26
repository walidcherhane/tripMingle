import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, X, Plus } from "lucide-react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useStorageUrl from "@/hooks/useStorageUrl";

interface VehicleImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  error?: string;
}

// Create a component for displaying a single image
const ImageThumbnail = ({ storageId }: { storageId: string }) => {
  const theme = useTheme();
  const { url, loading, error } = useStorageUrl(storageId);

  if (loading) {
    return (
      <View style={styles.imagePlaceholder}>
        <ActivityIndicator color={theme.colors.primary.brand} />
      </View>
    );
  }

  if (error || !url) {
    return (
      <View style={styles.imagePlaceholder}>
        <Camera size={24} color={theme.colors.gray[400]} />
      </View>
    );
  }

  return <Image source={{ uri: url }} style={styles.image} />;
};

export const VehicleImageUploader = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  error,
}: VehicleImageUploaderProps) => {
  const theme = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const getStorageUrl = useMutation(api.storage.getUrl);

  // Ensure images is always an array
  const safeImages = Array.isArray(images) ? images : [];

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: maxImages - safeImages.length,
      });

      if (!result.canceled) {
        await uploadImages(result.assets);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const uploadImages = async (
    pickerResults: ImagePicker.ImagePickerAsset[]
  ) => {
    setIsUploading(true);
    try {
      const newStorageIds = [];

      for (const image of pickerResults) {
        // Get a URL for uploading the image
        const uploadUrl = await generateUploadUrl();

        // Convert the image to a blob
        const response = await fetch(image.uri);
        const blob = await response.blob();

        // Upload the image to Convex storage
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": blob.type || "image/jpeg",
          },
          body: blob,
        });

        if (!result.ok) {
          throw new Error(`Failed to upload image: ${result.statusText}`);
        }

        // Get the storage ID from the response
        const { storageId } = await result.json();
        newStorageIds.push(storageId);
      }

      // Update the images array with the new storage IDs
      onImagesChange([...safeImages, ...newStorageIds]);
    } catch (error) {
      console.error("Error uploading images:", error);
      Alert.alert("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onImagesChange(safeImages.filter((_, index) => index !== indexToRemove));
  };

  const { width } = Dimensions.get("window");
  const imageSize = (width - 72) / 3; // 3 images per row with padding

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {safeImages.map((storageId, index) => (
          <View
            key={index}
            style={[
              styles.imageContainer,
              { borderColor: theme.colors.gray[300] },
            ]}
          >
            <ImageThumbnail storageId={storageId} />
            <TouchableOpacity
              style={[
                styles.removeButton,
                { backgroundColor: theme.colors.gray[900] + "CC" },
              ]}
              onPress={() => removeImage(index)}
            >
              <X size={16} color={theme.colors.background} />
            </TouchableOpacity>
          </View>
        ))}

        {safeImages.length < maxImages && (
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                borderColor: error
                  ? theme.colors.error
                  : theme.colors.gray[300],
              },
            ]}
            onPress={pickImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={theme.colors.primary.brand} />
            ) : (
              <>
                <Plus size={24} color={theme.colors.gray[500]} />
                <Typography
                  variant="sm"
                  style={{ color: theme.colors.gray[500], marginTop: 8 }}
                >
                  Add Photos
                </Typography>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {error && (
        <Typography
          variant="sm"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContainer: {
    gap: 12,
    paddingVertical: 8,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 12,
    padding: 4,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default VehicleImageUploader;
