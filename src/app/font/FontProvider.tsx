"use client";

import * as React from "react";

import {
  APP_FONT_STORAGE_KEY,
  normalizeFont,
  type AppFont,
} from "@/app/font/config";

type FontContextValue = {
  font: AppFont;
  useDyslexicFont: boolean;
  setFont: (font: AppFont) => void;
  setUseDyslexicFont: (enabled: boolean) => void;
  toggleDyslexicFont: () => void;
};

const FontContext = React.createContext<FontContextValue | null>(null);

function applyFont(font: AppFont) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.font = font;
}

function getStoredFont() {
  if (typeof window === "undefined") {
    return "default" as AppFont;
  }

  return normalizeFont(window.localStorage.getItem(APP_FONT_STORAGE_KEY));
}

function persistFont(font: AppFont) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_FONT_STORAGE_KEY, font);
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = React.useState<AppFont>(() => getStoredFont());

  React.useEffect(() => {
    applyFont(font);
  }, [font]);

  const setFont = React.useCallback((nextFont: AppFont) => {
    setFontState(nextFont);
    persistFont(nextFont);
  }, []);

  const setUseDyslexicFont = React.useCallback(
    (enabled: boolean) => {
      setFont(enabled ? "dyslexic" : "default");
    },
    [setFont],
  );

  const toggleDyslexicFont = React.useCallback(() => {
    setFontState((currentFont) => {
      const nextFont = currentFont === "dyslexic" ? "default" : "dyslexic";
      persistFont(nextFont);
      return nextFont;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      font,
      useDyslexicFont: font === "dyslexic",
      setFont,
      setUseDyslexicFont,
      toggleDyslexicFont,
    }),
    [font, setFont, setUseDyslexicFont, toggleDyslexicFont],
  );

  return <FontContext.Provider value={value}>{children}</FontContext.Provider>;
}

export function useAppFont() {
  const context = React.useContext(FontContext);

  if (!context) {
    throw new Error("useAppFont must be used within a FontProvider");
  }

  return context;
}
