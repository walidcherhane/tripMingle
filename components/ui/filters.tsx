import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { theme } from "@/theme";
import { Typography } from "./typography";

interface Props<Filter extends string> {
  filters: {
    label: string;
    value: Filter;
  }[];
  selectedFilter: Filter;
  onSelectFilter: (filter: Filter) => void;
}

const Filters = <TFilter extends string>({
  filters,
  selectedFilter,
  onSelectFilter,
}: Props<TFilter>) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filters}
    >
      {filters.map((filter) => (
        <FilterButton
          key={filter.value}
          label={filter.label}
          value={filter}
          onPress={() => onSelectFilter(filter.value)}
          active={selectedFilter === filter.value}
        />
      ))}
    </ScrollView>
  );
};

const FilterButton = <Type,>({
  label,
  value,
  onPress,
  active,
}: {
  label: string;
  value: Type;
  onPress: () => void;
  active?: boolean;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        {
          backgroundColor: active
            ? theme.colors.primary.brand
            : theme.colors.gray[100],
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Typography
        variant="sm"
        weight="medium"
        style={{
          color: active ? theme.colors.background : theme.colors.gray[500],
        }}
      >
        {label}
      </Typography>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  filters: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
    maxHeight: 40,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default Filters;
