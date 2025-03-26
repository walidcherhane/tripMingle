import { Easing, Animated } from "react-native";
import React from "react";
import { theme } from "@/theme";

const Skeleton = ({
  width,
  height,
  style,
}: {
  width: number | string;
  height: number;
  style?: any;
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          opacity: fadeAnim,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.gray[200],
        },
        style,
      ]}
    />
  );
};

export default Skeleton;
