// components/ui/multiple-file-uploader.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Upload, X, Plus } from "lucide-react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface MultipleFileUploaderProps {
  label: string;
  files: Id<"_storage">[];
  onFilesUpdated: (files: Id<"_storage">[]) => void;
  maxFiles?: number;
}

export const MultipleFileUploader: React.FC<MultipleFileUploaderProps> = ({
  label,
  files,
  onFilesUpdated,
  maxFiles = 5,
}) => {
  const theme = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tempImageUris, setTempImageUris] = useState<Record<string, string>>(
    {}
  );

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

  // Get URLs for all files
  const fileUrls = files.reduce<Record<string, string | null>>(
    (acc, storageId) => {
      const url = useQuery(api.storage.getUrl, { storageId });
      acc[storageId as unknown as string] = url || null;
      return acc;
    },
    {}
  );

  const pickAndUploadImages = async () => {
    if (files.length >= maxFiles) {
      setError(`You can upload a maximum of ${maxFiles} images`);
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        setError("Permission to access media library is required");
        return;
      }

      const remainingFiles = maxFiles - files.length;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingFiles,
      });

      if (result.canceled) return;

      setIsUploading(true);
      setError(null);

      const newFiles = [...files];
      const newTempImageUris = { ...tempImageUris };

      for (const asset of result.assets) {
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
          // Store temporary URI for display until we can fetch from Convex
          newTempImageUris[storageId] = asset.uri;

          newFiles.push(storageId as Id<"_storage">);
        }
      }

      setTempImageUris(newTempImageUris);
      onFilesUpdated(newFiles);
    } catch (err) {
      console.error("Error uploading files:", err);
      setError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesUpdated(newFiles);
  };

  return (
    <View style={styles.container}>
      <Typography variant="sm" style={styles.label}>
        {label}
      </Typography>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filesContainer}
      >
        {files.map((storageId, index) => (
          <View key={index} style={styles.fileItem}>
            <Image
              source={{
                uri:
                  tempImageUris[storageId as unknown as string] ||
                  fileUrls[storageId as unknown as string] ||
                  "",
              }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={[
                styles.removeButton,
                { backgroundColor: theme.colors.error },
              ]}
              onPress={() => removeFile(index)}
            >
              <X size={14} color="white" />
            </TouchableOpacity>
          </View>
        ))}

        {files.length < maxFiles && (
          <TouchableOpacity
            style={[styles.addButton, { borderColor: theme.colors.gray[300] }]}
            onPress={pickAndUploadImages}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color={theme.colors.primary.brand} />
            ) : (
              <Plus size={24} color={theme.colors.gray[500]} />
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <Typography variant="xs" color="gray.500" style={styles.helperText}>
        {files.length} of {maxFiles} images uploaded
      </Typography>

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
  filesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  fileItem: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  helperText: {
    marginTop: 4,
  },
  errorText: {
    marginTop: 8,
  },
});
