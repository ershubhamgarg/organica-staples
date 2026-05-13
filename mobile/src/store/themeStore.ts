import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkColors, lightColors } from "@/theme/colors";

type ColorScheme = "light" | "dark";

interface ThemeState {
  colorScheme: ColorScheme;
  colors: typeof lightColors;
  navigationTheme: Theme;
  toggleTheme: () => void;
  setTheme: (scheme: ColorScheme) => void;
}

function getNavigationTheme(scheme: ColorScheme): Theme {
  const colors = scheme === "dark" ? darkColors : lightColors;
  return {
    ...(scheme === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(scheme === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
      notification: colors.gold,
    },
  };
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colorScheme: "light",
      colors: lightColors,
      navigationTheme: getNavigationTheme("light"),
      toggleTheme: () =>
        set((state) => {
          const next = state.colorScheme === "dark" ? "light" : "dark";
          return {
            colorScheme: next,
            colors: next === "dark" ? darkColors : lightColors,
            navigationTheme: getNavigationTheme(next),
          };
        }),
      setTheme: (scheme) =>
        set({
          colorScheme: scheme,
          colors: scheme === "dark" ? darkColors : lightColors,
          navigationTheme: getNavigationTheme(scheme),
        }),
    }),
    {
      name: "amritya-mobile-theme",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ colorScheme: state.colorScheme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setTheme(state.colorScheme);
        }
      },
    },
  ),
);
