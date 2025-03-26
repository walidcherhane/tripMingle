import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { colors } from "@/theme/colors";
import { Typography } from "../ui/typography";
import FormError from "./form-error";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  multiline?: boolean;
  numberOfLines?: number;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View style={styles.container}>
          <Typography variant="xs" style={styles.label}>
            {label}
          </Typography>
          <TextInput
            style={[
              styles.input,
              multiline && styles.multiline,
              error && styles.errorInput,
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder={placeholder}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
          />
          <FormError error={error} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  errorInput: {
    borderColor: colors.error,
  },
});
