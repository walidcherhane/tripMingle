import Filters from "@/components/ui/filters";
import React from "react";
import { StyleSheet, View } from "react-native";

export type FilterPeriodKeys = "today" | "week" | "month" | "all";

interface TripFiltersProps {
  selectedPeriod: FilterPeriodKeys;
  onPeriodChange: (period: FilterPeriodKeys) => void;
}

export const TripFilters = ({
  selectedPeriod,
  onPeriodChange,
}: TripFiltersProps) => {
  const periods: {
    label: string;
    value: FilterPeriodKeys;
  }[] = [
    {
      label: "Today",
      value: "today",
    },
    {
      label: "Week",
      value: "week",
    },
    {
      label: "Month",
      value: "month",
    },
    {
      label: "All",
      value: "all",
    },
  ];

  return (
    <View style={styles.container}>
      <Filters
        filters={periods}
        onSelectFilter={onPeriodChange}
        selectedFilter={selectedPeriod}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
});
