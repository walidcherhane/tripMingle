// src/hooks/useTheme.ts
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { ThemeContextValue } from "@/types/theme";

export const useTheme = (): ThemeContextValue => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return theme;
};
