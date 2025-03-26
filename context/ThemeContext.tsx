// src/context/ThemeContext.tsx
import React, { createContext, useCallback, ReactNode } from "react";
import { theme as defaultTheme } from "../theme";
import {
  Theme,
  ThemeContextValue,
  SpacingKey,
  FontSizeKey,
  Colors,
  ColorKey,
} from "@/types/theme";

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
  theme?: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  theme = defaultTheme,
}) => {
  const getColor = useCallback(
    (path: ColorKey | string): string => {
      return path
        .split(".")
        .reduce(
          (obj, key) => (obj as { [key: string]: any })?.[key],
          theme.colors
        );
    },
    [theme]
  );

  const getSpacing = useCallback(
    (size: SpacingKey | number): number => {
      if (typeof size === "number") return size;
      return theme.spacing[size];
    },
    [theme]
  );

  const getFontSize = useCallback(
    (size: FontSizeKey | number): number => {
      if (typeof size === "number") return size;
      return theme.typography.sizes[size];
    },
    [theme]
  );

  const value: ThemeContextValue = {
    ...theme,
    getColor,
    getSpacing,
    getFontSize,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
