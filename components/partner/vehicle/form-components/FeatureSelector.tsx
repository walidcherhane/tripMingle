import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";

interface FeatureSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ label: string; value: string }>;
  error?: string;
}

export const FeatureSelector = ({
  value,
  onChange,
  options,
  error,
}: FeatureSelectorProps) => {
  const theme = useTheme();

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  const toggleFeature = (featureValue: string) => {
    if (safeValue.includes(featureValue)) {
      onChange(safeValue.filter((v) => v !== featureValue));
    } else {
      onChange([...safeValue, featureValue]);
    }
  };

  return (
    <View style={styles.featuresContainer}>
      {options.map((option) => {
        const isSelected = safeValue.includes(option.value);

        return (
          <Pressable
            key={option.value}
            style={[
              styles.featureOption,
              {
                borderColor: isSelected
                  ? theme.colors.primary.brand
                  : theme.colors.gray[200],
                backgroundColor: isSelected
                  ? theme.colors.gray[100]
                  : theme.colors.background,
              },
            ]}
            onPress={() => toggleFeature(option.value)}
          >
            <Typography
              variant="sm"
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
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  featureOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
});

export default FeatureSelector;
