import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FileText, X } from "lucide-react-native";
import { COLORS, SPACING } from "../../utils/constants";
import { Typography } from "@/components/ui/typography";

interface DocumentUploaderProps {
  title: string;
  image: string | null;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  loading?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  title,
  image,
  onImageSelected,
  onImageRemoved,
  loading = false,
}) => {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={onImageRemoved}
          >
            <X size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <FileText size={24} color={COLORS.primary} />
          <Typography style={styles.uploadText}>{title}</Typography>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background.input,
  },
  uploadText: {
    marginTop: SPACING.xs,
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    backgroundColor: COLORS.background.card,
    borderRadius: 20,
    padding: SPACING.xs,
  },
});
