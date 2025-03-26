import React from "react";
import { View, StyleSheet } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";
import { MapPin, Clock } from "lucide-react-native";
import type { Location } from "@/types/trip";

interface TripRouteProps {
  pickup: Location;
  dropoff: Location;
  time: string;
}

export const TripRoute = ({ pickup, dropoff, time }: TripRouteProps) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.routeInfo}>
        <View style={styles.locationPoint}>
          <MapPin size={16} color={theme.colors.success} />
          <Typography
            variant="md"
            numberOfLines={1}
            style={styles.locationText}
          >
            {pickup.name}
          </Typography>
        </View>
        <View style={styles.routeDivider} />
        <View style={styles.locationPoint}>
          <MapPin size={16} color={theme.colors.error} />
          <Typography
            variant="md"
            numberOfLines={1}
            style={styles.locationText}
          >
            {dropoff.name}
          </Typography>
        </View>
      </View>

      <View style={styles.tripTime}>
        <Clock size={16} color={theme.colors.gray[500]} />
        <Typography
          variant="sm"
          style={{ color: theme.colors.gray[500], marginLeft: 4 }}
        >
          {time}
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  routeInfo: {
    gap: 4,
  },
  locationPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    flex: 1,
  },
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: "#E5E7EB",
    marginLeft: 8,
  },
  tripTime: {
    flexDirection: "row",
    alignItems: "center",
  },
});
