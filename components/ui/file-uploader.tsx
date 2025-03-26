// components/ui/file-uploader.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Upload, X, Image as ImageIcon } from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface FileUploaderProps {
  label: string;
  onFileUploaded: (storageId: Id<"_storage">) => void;
  storageId?: Id<"_storage">;
  onRemove?: () => void;
  multiple?: boolean;
  maxFiles?: number;
  allowedTypes?: string[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  label,
  onFileUploaded,
  storageId,
  onRemove,
  multiple = false,
  maxFiles = 1,
  allowedTypes = ["image/*"],
}) => {
  const theme = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const fileUrl = useQuery(
    api.storage.getUrl,
    storageId ? { storageId } : "skip"
  );

  const pickAndUploadImage = async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access media library is required");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: multiple,
        selectionLimit: maxFiles,
      });

      if (result.canceled) return;

      setIsUploading(true);
      setError(null);

      // For each selected asset, upload to Convex
      for (const asset of result.assets) {
        // Save temporary URI for display until the file is uploaded
        setTempImageUri(asset.uri);

        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();

        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": asset.mimeType || "image/jpeg",
          },
          body: asset.file,
        });

        const { storageId } = await result.json();
        if (storageId) {
          onFileUploaded(storageId as Id<"_storage">);
          setTempImageUri(null);
        }
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Typography variant="sm" style={styles.label}>
        {label}
      </Typography>

      {(storageId && fileUrl) || tempImageUri ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: tempImageUri || fileUrl || "" }}
            style={styles.image}
            resizeMode="cover"
          />
          {onRemove && (
            <TouchableOpacity
              style={[
                styles.removeButton,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={onRemove}
            >
              <X size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, { borderColor: theme.colors.gray[300] }]}
          onPress={pickAndUploadImage}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color={theme.colors.primary.brand} />
          ) : (
            <>
              <Upload size={24} color={theme.colors.gray[500]} />
              <Typography
                variant="sm"
                color="gray.500"
                style={styles.uploadText}
              >
                {multiple ? "Select Images" : "Select Image"}
              </Typography>
            </>
          )}
        </TouchableOpacity>
      )}

      {error && (
        <Typography
          variant="xs"
          style={[styles.errorText, { color: theme.colors.error }]}
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
  label: {
    marginBottom: 8,
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  uploadText: {
    marginTop: 8,
  },
  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 8,
  },
});
