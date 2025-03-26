// src/theme/index.js

import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { Theme } from "@/types/theme";

export const theme: Theme = {
  colors,
  typography,
  spacing,
  // Add other theme properties as needed,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  icons: {
    sizes: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 48,
    },
  },
};
