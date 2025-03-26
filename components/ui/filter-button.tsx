import { Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { Typography } from "./typography";
import { theme } from "@/theme";

const FilterButton = <Type,>({
  label,
  value,
  onPress,
}: {
  label: string;
  value: Type;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterButton,
        {
          backgroundColor: pressed
            ? theme.colors.primary.brand
            : theme.colors.gray[100],
          opacity: pressed ? 0.8 : 1,
          color: pressed ? theme.colors.background : theme.colors.gray[500],
        },
      ]}
    >
      <Typography
        variant="sm"
        weight="medium"
        style={{
          color: "currentColor",
        }}
      >
        {label}
      </Typography>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
export default FilterButton;
