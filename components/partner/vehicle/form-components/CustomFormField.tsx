import React from "react";
import { View, StyleSheet, TextInput } from "react-native";
import { Typography } from "@/components/ui/typography";
import { useTheme } from "@/hooks/useTheme";

interface CustomFormFieldProps {
  label: string;
  placeholder?: string;
  value: any;
  onChangeText: (text: string) => void;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  type?: string;
  options?: Array<{ label: string; value: string }>;
}

export const CustomFormField = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  keyboardType = "default",
}: CustomFormFieldProps) => {
  const theme = useTheme();

  return (
    <View style={styles.formFieldContainer}>
      <Typography variant="sm" style={styles.formFieldLabel}>
        {label}
      </Typography>
      <TextInput
        style={[
          styles.formFieldInput,
          error ? { borderColor: theme.colors.error } : null,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
      {error && (
        <Typography variant="xs" style={{ color: theme.colors.error }}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formFieldContainer: {
    marginBottom: 16,
  },
  formFieldLabel: {
    marginBottom: 8,
    fontWeight: "500",
  },
  formFieldInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

export default CustomFormField;
