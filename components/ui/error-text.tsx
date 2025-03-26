import React from "react";
import { StyleSheet } from "react-native";
import { COLORS } from "../../utils/constants";
import { Typography } from "@/components/ui/typography";

interface ErrorTextProps {
  message: string;
}

export const ErrorText: React.FC<ErrorTextProps> = ({ message }) => (
  <Typography style={styles.errorText}>{message}</Typography>
);

const styles = StyleSheet.create({
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
});
