import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Car, X, ChevronLeft, ChevronRight } from "lucide-react-native";
import useStorageUrl from "@/hooks/useStorageUrl";
import { PinchGestureHandler, State } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.8; // Each item takes 80% of screen width
const ITEM_HEIGHT = 250; // Fixed height for the carousel
const SPACING = 10; // Spacing between items

interface VehicleImageGalleryProps {
  imageIds: string[];
  initialIndex?: number;
}

// Component to display a single image with loading state
const GalleryImage = ({
  storageId,
  onPress,
  size = "carousel",
}: {
  storageId: string;
  onPress?: () => void;
  size?: "carousel" | "full";
}) => {
  const theme = useTheme();
  const { url, loading, error } = useStorageUrl(storageId);

  const imageStyle =
    size === "carousel" ? styles.carouselImage : styles.fullImage;

  const containerStyle =
    size === "carousel"
      ? styles.carouselImageContainer
      : styles.fullImageContainer;

  if (loading) {
    return (
      <View
        style={[containerStyle, { backgroundColor: theme.colors.gray[200] }]}
      >
        <ActivityIndicator color={theme.colors.primary.brand} />
      </View>
    );
  }

  if (error || !url) {
    return (
      <View
        style={[containerStyle, { backgroundColor: theme.colors.gray[200] }]}
      >
        <Car
          size={size === "carousel" ? 24 : 40}
          color={theme.colors.gray[400]}
        />
      </View>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Image source={{ uri: url }} style={imageStyle} resizeMode="cover" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      <Image source={{ uri: url }} style={imageStyle} resizeMode="contain" />
    </View>
  );
};

// Zooming modal component
const ImageZoomModal = ({
  visible,
  imageId,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: {
  visible: boolean;
  imageId: string | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}) => {
  const theme = useTheme();
  const [scale, setScale] = useState(1);

  if (!imageId) return null;

  const handlePinchGesture = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setScale(event.nativeEvent.scale);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              { backgroundColor: theme.colors.gray[900] + "80" },
            ]}
            onPress={onClose}
          >
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>

        <PinchGestureHandler
          onGestureEvent={handlePinchGesture}
          onHandlerStateChange={handlePinchGesture}
        >
          <View style={styles.zoomContainer}>
            <GalleryImage storageId={imageId} size="full" />
          </View>
        </PinchGestureHandler>

        <View style={styles.navigationContainer}>
          {hasPrevious && (
            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: theme.colors.gray[900] + "80" },
              ]}
              onPress={onPrevious}
            >
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
          )}

          {hasNext && (
            <TouchableOpacity
              style={[
                styles.navButton,
                { backgroundColor: theme.colors.gray[900] + "80" },
              ]}
              onPress={onNext}
            >
              <ChevronRight size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const VehicleImageGallery = ({
  imageIds,
  initialIndex = 0,
}: VehicleImageGalleryProps) => {
  const theme = useTheme();
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialIndex);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const carouselRef = useRef<FlatList>(null);

  // Filter out any undefined or null values
  const safeImageIds = imageIds.filter((id) => id);

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setZoomModalVisible(true);
  };

  const handleNextImage = () => {
    if (selectedImageIndex < safeImageIds.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // If there are no images, show a placeholder
  if (safeImageIds.length === 0) {
    return (
      <View
        style={[
          styles.noImagesContainer,
          { backgroundColor: theme.colors.gray[200] },
        ]}
      >
        <Car size={48} color={theme.colors.gray[400]} />
        <Typography
          variant="md"
          style={{ color: theme.colors.gray[500], marginTop: 12 }}
        >
          No images available
        </Typography>
      </View>
    );
  }

  // Pagination indicator
  const renderPaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {safeImageIds.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  selectedImageIndex === index
                    ? theme.colors.primary.brand
                    : theme.colors.gray[300],
                width: selectedImageIndex === index ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main carousel */}
      <FlatList
        ref={carouselRef}
        data={safeImageIds}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.carouselItem}
            onPress={() => handleImagePress(index)}
          >
            <GalleryImage storageId={item} size="carousel" />
          </Pressable>
        )}
        keyExtractor={(item, index) => `carousel-${item}-${index}`}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / (ITEM_WIDTH + SPACING)
          );
          setSelectedImageIndex(newIndex);
        }}
      />

      {/* Pagination dots */}
      {renderPaginationDots()}

      {/* Zoom modal */}
      <ImageZoomModal
        visible={zoomModalVisible}
        imageId={safeImageIds[selectedImageIndex]}
        onClose={() => setZoomModalVisible(false)}
        onNext={handleNextImage}
        onPrevious={handlePreviousImage}
        hasNext={selectedImageIndex < safeImageIds.length - 1}
        hasPrevious={selectedImageIndex > 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: ITEM_HEIGHT + 30, // Add space for pagination dots
  },
  carouselContent: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2, // Center the first and last items
    paddingVertical: 10,
  },
  carouselItem: {
    width: ITEM_WIDTH,
    marginHorizontal: SPACING / 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  carouselImageContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  fullImageContainer: {
    width,
    height: height * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    height: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomContainer: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  navigationContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  noImagesContainer: {
    width: "100%",
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
});

export default VehicleImageGallery;
