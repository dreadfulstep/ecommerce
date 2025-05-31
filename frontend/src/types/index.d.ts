import { ReactNode } from "react";

export interface SettingsCategoryItem {
  icon: ReactNode;
  name: string;
}

export type Theme = "dark" | "light";

export interface ColorOption {
  name: string;
  value: string;
  hsl: string;
  hue: string;
}