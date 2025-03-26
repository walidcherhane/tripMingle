export interface Colors {
  primary: {
    brand: string;
    darkest: string;
    dark: string;
    mid: string;
    light: string;
    lightest: string;
  };
  success: string;
  error: string;
  warning: string;
  info: string;
  gray: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  background: string;
  text: string;
  border: string;
}

export interface Typography {
  fontFamily: string;
  weights: {
    thin: "100";
    extralight: "200";
    light: "300";
    normal: "400";
    medium: "500";
    semibold: "600";
    bold: "700";
    extrabold: "800";
    black: "900";
  };
  sizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    "2xl": number;
    "3xl": number;
    "4xl": number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
  };
}

export type SpacingKey = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type FontSizeKey = keyof Typography["sizes"];
export type WeightKey = keyof Typography["weights"];
export type ColorKey =
  | keyof Colors
  | `${keyof Colors}.${number}`
  | {
      [K in keyof Colors]: Colors[K] extends object
        ? `${K}.${Extract<keyof Colors[K], string>}`
        : never;
    }[keyof Colors];

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
}

export interface Shadow {
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    sm: Shadow;
    md: Shadow;
  };
  icons: {
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
}

export interface ThemeContextValue extends Theme {
  getColor: (path: ColorKey | string) => string;
  getSpacing: (size: SpacingKey | number) => number;
  getFontSize: (size: FontSizeKey | number) => number;
}
