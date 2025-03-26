import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { Calendar, Upload, Check } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface DocumentUploaderProps {
  label: string;
  value: { storageId?: string; expiryDate?: string } | undefined;
  onChange: (value: { storageId?: string; expiryDate?: string }) => void;
  error?: string;
}

export const DocumentUploader = ({
  label,
  value,
  onChange,
  error,
}: DocumentUploaderProps) => {
  const theme = useTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentUpload = async () => {
    try {
      // Use ImagePicker instead of DocumentPicker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      setIsUploading(true);
      const file = result.assets[0];

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload the file
      const response = await fetch(file.uri);
      const blob = await response.blob();

      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": blob.type || "image/jpeg",
        },
        body: blob,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload document");
      }

      const { storageId } = await uploadResult.json();

      // Update the form value with a null check
      onChange({
        ...(value || {}),
        storageId,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to upload document");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
      onChange({
        ...(value || {}),
        expiryDate: formattedDate,
      });
    }
  };

  return (
    <View style={styles.documentContainer}>
      <Typography variant="sm" weight="medium" style={styles.documentLabel}>
        {label}
      </Typography>

      <View style={styles.documentRow}>
        <Pressable
          style={[
            styles.documentUploadButton,
            {
              borderColor: value?.storageId
                ? theme.colors.success
                : error
                  ? theme.colors.error
                  : theme.colors.gray[300],
              backgroundColor: value?.storageId
                ? theme.colors.gray[100]
                : theme.colors.background,
            },
          ]}
          onPress={handleDocumentUpload}
        >
          {isUploading ? (
            <ActivityIndicator color={theme.colors.primary.brand} />
          ) : (
            <>
              {value?.storageId ? (
                <Check size={20} color={theme.colors.success} />
              ) : (
                <Upload size={20} color={theme.colors.gray[500]} />
              )}
              <Typography
                variant="sm"
                style={{
                  color: value?.storageId
                    ? theme.colors.success
                    : theme.colors.gray[500],
                  marginLeft: 8,
                }}
              >
                {value?.storageId ? "Document Uploaded" : "Upload Document"}
              </Typography>
            </>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.expiryDateButton,
            {
              borderColor: theme.colors.gray[300],
              backgroundColor: theme.colors.background,
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} color={theme.colors.gray[500]} />
          <Typography
            variant="sm"
            style={{
              color: theme.colors.gray[500],
              marginLeft: 8,
            }}
          >
            {value?.expiryDate || "Set Expiry Date"}
          </Typography>
        </Pressable>
      </View>

      {error && (
        <Typography
          variant="xs"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Typography>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={value?.expiryDate ? new Date(value.expiryDate) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  documentContainer: {
    marginBottom: 20,
  },
  documentLabel: {
    marginBottom: 8,
  },
  documentRow: {
    flexDirection: "row",
    gap: 12,
  },
  documentUploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  expiryDateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default DocumentUploader;
