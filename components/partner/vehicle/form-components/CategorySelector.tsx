import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  error?: string;
}

export const CategorySelector = ({
  value,
  onChange,
  options,
  error,
}: CategorySelectorProps) => {
  const theme = useTheme();

  return (
    <View style={styles.categoryContainer}>
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <Pressable
            key={option.value}
            style={[
              styles.categoryOption,
              {
                borderColor: isSelected
                  ? theme.colors.primary.brand
                  : theme.colors.gray[200],
                backgroundColor: isSelected
                  ? theme.colors.gray[100]
                  : theme.colors.background,
              },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Typography
              variant="md"
              weight={isSelected ? "semibold" : "medium"}
              style={{
                color: isSelected
                  ? theme.colors.primary.brand
                  : theme.colors.text,
              }}
            >
              {option.label}
            </Typography>
          </Pressable>
        );
      })}

      {error && (
        <Typography
          variant="xs"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 24,
  },
  categoryOption: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 12,
    alignItems: "center",
  },
});

export default CategorySelector;
