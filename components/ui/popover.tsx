// components/ui/popover.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  LayoutChangeEvent,
  ViewStyle,
  StyleProp,
} from "react-native";
import { theme } from "@/theme";

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface PopoverProps {
  visible: boolean;
  onDismiss: () => void;
  anchor: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  backdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  anchor: {
    position: "absolute",
  },
  content: {
    position: "absolute",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    shadowColor: theme.colors.gray[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 150,
  },
});

export const Popover: React.FC<PopoverProps> = ({
  visible,
  onDismiss,
  anchor,
  children,
  position = "bottom",
  style,
}) => {
  const [anchorPosition, setAnchorPosition] = useState<Position | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const anchorRef = React.useRef<View>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      scaleAnim.setValue(0.95);
    }
  }, [visible]);

  const measureAnchor = () => {
    if (anchorRef.current) {
      anchorRef.current.measureInWindow((x, y, width, height) => {
        setAnchorPosition({ top: y, left: x, width, height });
      });
    }
  };

  const getContentPosition = (): ViewStyle => {
    if (!anchorPosition) return {};

    const { width: screenWidth, height: screenHeight } =
      Dimensions.get("window");
    let top = anchorPosition.top;
    let left = anchorPosition.left;

    switch (position) {
      case "bottom":
        top += anchorPosition.height + 8;
        break;
      case "top":
        top -= contentHeight + 8;
        break;
      case "left":
        left -= 150 + 8;
        top += (anchorPosition.height - contentHeight) / 2;
        break;
      case "right":
        left += anchorPosition.width + 8;
        top += (anchorPosition.height - contentHeight) / 2;
        break;
    }

    // Adjust if content goes beyond screen bounds
    if (left + 150 > screenWidth) {
      left = screenWidth - 150 - 8;
    }
    if (left < 8) {
      left = 8;
    }
    if (top + contentHeight > screenHeight) {
      top = screenHeight - contentHeight - 8;
    }
    if (top < 8) {
      top = 8;
    }

    return {
      top,
      left,
    };
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  };

  useEffect(() => {
    if (visible) {
      measureAnchor();
    }
  }, [visible]);

  if (!visible) return <View ref={anchorRef}>{anchor}</View>;

  return (
    <Modal transparent visible={visible} onRequestClose={onDismiss}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={onDismiss} />
        </Animated.View>
        <View ref={anchorRef} style={styles.anchor}>
          {anchor}
        </View>
        <Animated.View
          onLayout={handleLayout}
          style={[
            styles.content,
            getContentPosition(),
            style,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};
