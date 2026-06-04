"use client";

import * as React from "react";

import {
  APP_THEME_STORAGE_KEY,
  normalizeTheme,
  type AppTheme,
} from "./config";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  cycleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function resolveSystemTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = theme === "system" ? resolveSystemTheme() : theme;

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "system" as AppTheme;
  }

  return normalizeTheme(window.localStorage.getItem(APP_THEME_STORAGE_KEY));
}

function persistTheme(theme: AppTheme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = React.useState<AppTheme>(() => getStoredTheme());

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", updateSystemTheme);

    return () => {
      mediaQuery.removeEventListener("change", updateSystemTheme);
    };
  }, [theme]);

  const setTheme = React.useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
    persistTheme(nextTheme);
  }, []);

  const cycleTheme = React.useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme =
        currentTheme === "system"
          ? "light"
          : currentTheme === "light"
            ? "dark"
            : "system";

      persistTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      cycleTheme,
    }),
    [cycleTheme, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }

  return context;
}
