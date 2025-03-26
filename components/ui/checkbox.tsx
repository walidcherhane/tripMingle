// @/components/ui/Checkbox.tsx
import React from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Check } from "lucide-react-native";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
  disabled?: boolean;
  style?: object;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  size = 24,
  disabled = false,
  style,
}) => {
  // Animation value for scaling effect
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  // Animation value for the checkmark
  const checkmarkValue = React.useRef(
    new Animated.Value(checked ? 1 : 0)
  ).current;

  React.useEffect(() => {
    // Animate checkbox when checked state changes
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.8,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate checkmark
    Animated.timing(checkmarkValue, {
      toValue: checked ? 1 : 0,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, [checked]);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 6,
  };

  const checkStyle = {
    transform: [
      { scale: checkmarkValue },
      {
        translateY: checkmarkValue.interpolate({
          inputRange: [0, 1],
          outputRange: [size / 4, 0],
        }),
      },
    ],
    opacity: checkmarkValue,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.touchable, style]}
      activeOpacity={0.6}
    >
      <Animated.View
        style={[
          styles.container,
          containerStyle,
          checked && styles.containerChecked,
          disabled && styles.containerDisabled,
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        <Animated.View style={checkStyle}>
          <Check size={size * 0.6} color="#FFFFFF" strokeWidth={3} />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  containerChecked: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  containerDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
});

export default Checkbox;
