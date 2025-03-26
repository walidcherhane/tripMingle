// components/dashboard/dashboard-skeleton.tsx
import React from "react";
import { View, StyleSheet, Animated, Easing, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export const DashboardSkeleton = () => {
  const theme = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const Skeleton = ({ style }: { style: ViewStyle }) => (
    <Animated.View
      style={[
        style,
        {
          backgroundColor: theme.colors.gray[200],
          opacity,
          borderRadius: theme.borderRadius.md,
        },
      ]}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View>
          <Skeleton style={styles.smallText} />
          <Skeleton style={styles.largeText} />
        </View>
        <View style={styles.actions}>
          <Skeleton style={styles.circle} />
          <Skeleton style={styles.circle} />
        </View>
      </View>

      {/* Content Skeleton */}
      <View style={styles.content}>
        {/* Current Trip Card */}
        <Skeleton style={styles.card} />

        {/* Stats */}
        <View style={styles.statsContainer}>
          <Skeleton style={styles.stat} />
          <Skeleton style={styles.stat} />
          <Skeleton style={styles.stat} />
        </View>

        {/* Vehicle Status */}
        <Skeleton style={styles.smallCard} />

        {/* Upcoming Bookings */}
        <View style={styles.section}>
          <Skeleton style={styles.sectionTitle} />
          <Skeleton style={styles.listItem} />
          <Skeleton style={styles.listItem} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  smallText: {
    width: 80,
    height: 16,
    marginBottom: 8,
  },
  largeText: {
    width: 150,
    height: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    padding: 16,
  },
  card: {
    height: 200,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    height: 100,
  },
  smallCard: {
    height: 80,
    marginBottom: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    width: 150,
    height: 24,
  },
  listItem: {
    height: 60,
  },
});
