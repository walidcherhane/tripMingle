// components/dashboard/vehicle/vehicle-documents.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { FileText, AlertCircle, CheckCircle, Clock } from "lucide-react-native";
import { DocumentPreviewModal } from "./document-preview-modal";
import { Doc, Id } from "@/convex/_generated/dataModel";
import useStorageUrl from "@/hooks/useStorageUrl";

interface Document extends Doc<"documents"> {}

interface VehicleDocumentsProps {
  documents: Document[];
  onUpdateDocument: (type: string) => void;
  onViewDocument: (document: Document) => void;
}

// Add a DocumentThumbnail component
const DocumentThumbnail = ({ storageId }: { storageId: Id<"_storage"> }) => {
  const theme = useTheme();
  const { url, loading } = useStorageUrl(storageId);

  if (loading) {
    return (
      <View style={styles.thumbnailContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary.brand} />
      </View>
    );
  }

  if (!url) {
    return (
      <View style={styles.thumbnailContainer}>
        <FileText size={16} color={theme.colors.gray[400]} />
      </View>
    );
  }

  return (
    <Image source={{ uri: url }} style={styles.thumbnail} resizeMode="cover" />
  );
};

export const VehicleDocuments = ({
  documents,
  onUpdateDocument,
  onViewDocument,
}: VehicleDocumentsProps) => {
  const [previewDocument, setPreviewDocument] = React.useState<Document | null>(
    null
  );
  const theme = useTheme();

  const getStatusColor = (status: Document["status"]) => {
    switch (status) {
      case "valid":
        return theme.colors.success;
      case "expired":
        return theme.colors.error;
    }
  };

  const getStatusIcon = (status: Document["status"]) => {
    switch (status) {
      case "valid":
        return CheckCircle;
      case "expired":
        return AlertCircle;
    }
  };

  return (
    <Card>
      <View style={styles.header}>
        <Typography
          variant="lg"
          weight="semibold"
          style={{ color: theme.colors.text }}
        >
          Documents
        </Typography>
        <Button
          size="sm"
          variant="secondary"
          title="Update All"
          onPress={() => onUpdateDocument("all")}
          leftIcon={<FileText size={16} />}
        />
      </View>

      <View style={styles.documentList}>
        {documents.map((doc, index) => {
          const StatusIcon = getStatusIcon(doc.status);
          const statusColor = getStatusColor(doc.status);

          return (
            <Pressable
              key={doc.type}
              style={({ pressed }) => [
                styles.documentItem,
                index < documents.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.gray[200],
                },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setPreviewDocument(doc)}
            >
              <View style={styles.documentInfo}>
                <DocumentThumbnail storageId={doc.storageId} />
                <View>
                  <Typography
                    variant="md"
                    weight="medium"
                    style={{ color: theme.colors.text }}
                  >
                    {doc.type}
                  </Typography>
                  <Typography
                    variant="sm"
                    style={{ color: theme.colors.gray[500] }}
                  >
                    Expires: {doc.expiryDate}
                  </Typography>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${statusColor}10` },
                ]}
              >
                <Typography
                  variant="sm"
                  weight="medium"
                  style={{ color: statusColor }}
                >
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </Typography>
              </View>
            </Pressable>
          );
        })}
      </View>
      <DocumentPreviewModal
        visible={!!previewDocument}
        document={previewDocument}
        onClose={() => setPreviewDocument(null)}
        onUpdate={() => {}}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  documentList: {
    gap: 12,
  },
  documentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  thumbnailContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
});
