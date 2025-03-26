import { View, StyleSheet } from "react-native";
import React from "react";
import { Typography } from "../ui/typography";
import { colors } from "@/theme/colors";
import { FieldError } from "react-hook-form";

interface FormErrorProps {
  error?: FieldError;
}

const FormError = ({ error }: FormErrorProps) => {
  if (!error) return null;
  return (
    <Typography variant="xs" style={styles.errorText}>
      {error.message}
    </Typography>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormError;
