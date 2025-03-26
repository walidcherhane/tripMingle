// components/client/quick-booking.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Plane, Car, Building2, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useBooking } from "@/context/BookingContext";

const BOOKING_OPTIONS = [
  {
    id: "airport",
    title: "Airport",
    subtitle: "Transfers",
    icon: Plane,
  },
  {
    id: "city",
    title: "City",
    subtitle: "Tours",
    icon: Building2,
  },
  {
    id: "intercity",
    title: "Intercity",
    subtitle: "Travel",
    icon: Car,
  },
  {
    id: "hourly",
    title: "By Hour",
    subtitle: "Hire",
    icon: Clock,
  },
];

export const QuickBooking = () => {
  const { getSpacing, colors } = useTheme();
  const router = useRouter();
  const { resetBooking } = useBooking();

  const handleBookingOptionPress = (optionId: string) => {
    console.log("[DEBUG] Resetting booking state from quick booking", optionId);
    resetBooking();
    router.push("/(main)/client/booking");
  };

  return (
    <View style={[styles.container, { padding: getSpacing("md") }]}>
      <View style={styles.grid}>
        {BOOKING_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                {
                  padding: getSpacing("md"),
                  backgroundColor: colors.gray[50],
                  borderRadius: getSpacing("md"),
                },
              ]}
              onPress={() => handleBookingOptionPress(option.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: colors.primary.brand + "10",
                    padding: getSpacing("sm"),
                    borderRadius: getSpacing("sm"),
                  },
                ]}
              >
                <Icon size={24} color={colors.primary.brand} />
              </View>
              <Typography variant="sm" weight="semibold" color="primary.dark">
                {option.title}
              </Typography>
              <Typography variant="xs" color="gray.500">
                {option.subtitle}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  option: {
    flex: 1,
    minWidth: "47%",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
