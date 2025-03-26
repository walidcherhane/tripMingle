import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { X, Upload, Calendar, Download } from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useStorageUrl from "@/hooks/useStorageUrl";

interface Document {
  type: Doc<"documents">["type"];
  expiryDate: string;
  status: Doc<"documents">["status"];
  storageId: Id<"_storage">;
}

interface DocumentPreviewModalProps {
  visible: boolean;
  document: Doc<"documents"> | null;
  onClose: () => void;
  onUpdate: (
    documentType: Doc<"documents">["type"],
    newStorageId: Id<"_storage">,
    newExpiryDate: string
  ) => void;
}

export const DocumentPreviewModal = ({
  visible,
  document,
  onClose,
  onUpdate,
}: DocumentPreviewModalProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const { url: fileUrl, loading: loadingUrl } = useStorageUrl(
    document?.storageId
  );

  const handleDocumentUpdate = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && document) {
        setLoading(true);
        // In a real app, you would upload the file to your server here
        // For now, we'll just simulate a delay
        setTimeout(() => {
          onUpdate(
            document.type,
            result.assets[0].uri as any, // This should be the storageId in a real implementation
            new Date().toISOString()
          );
          setLoading(false);
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update document");
    }
  };

  if (!document) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Typography
              variant="lg"
              weight="semibold"
              style={{ color: theme.colors.text }}
            >
              {document.type}
            </Typography>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.7 },
                { backgroundColor: theme.colors.gray[100] },
              ]}
            >
              <X size={20} color={theme.colors.gray[500]} />
            </Pressable>
          </View>

          {/* Document Preview */}
          <View style={styles.previewContainer}>
            {fileUrl ? (
              <Image
                source={{ uri: fileUrl }}
                style={styles.documentImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.primary.brand}
                />
                <Typography
                  variant="sm"
                  style={{ marginTop: 12, color: theme.colors.gray[500] }}
                >
                  Loading document...
                </Typography>
              </View>
            )}
          </View>

          {/* Document Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={theme.colors.gray[500]} />
              <Typography
                variant="sm"
                style={{ ...styles.infoText, color: theme.colors.gray[500] }}
              >
                Expires: {document.expiryDate}
              </Typography>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Update Document"
              size="md"
              leftIcon={<Upload size={20} />}
              onPress={handleDocumentUpdate}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: height * 0.9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  previewContainer: {
    width: "100%",
    height: height * 0.4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  documentImage: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    marginVertical: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
