import React, { useEffect } from "react";
import { View, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { Typography } from "./typography";
import { theme } from "@/theme";
import {
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react-native";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  duration = 3000,
  onClose,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [duration, opacity, onClose]);

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle size={20} color={theme.colors.success} />,
          backgroundColor: theme.colors.success,
          borderColor: theme.colors.success,
        };
      case "error":
        return {
          icon: <AlertCircle size={20} color={theme.colors.error} />,
          backgroundColor: theme.colors.error,
          borderColor: theme.colors.error,
        };
      case "warning":
        return {
          icon: <AlertTriangle size={20} color={theme.colors.warning} />,
          backgroundColor: theme.colors.warning,
          borderColor: theme.colors.warning,
        };
      case "info":
      default:
        return {
          icon: <Info size={20} color={theme.colors.info} />,
          backgroundColor: theme.colors.info,
          borderColor: theme.colors.info,
        };
    }
  };

  const { icon, backgroundColor, borderColor } = getIconAndColor();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.content}>
        {icon}
        <Typography style={styles.message}>{message}</Typography>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <X size={16} color={theme.colors.gray[500]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    elevation: 5,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  message: {
    marginLeft: theme.spacing.sm,
    flex: 1,
    color: theme.colors.gray[900],
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
});
