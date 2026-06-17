"use client";

import { useState } from "react";

import { useAppLocale } from "@/app/i18n/useAppLocale";
import { useAppTheme } from "@/app/theme/ThemeProvider";
import { AppearancePreferencesSection } from "@/modules/settings/components/preferences/AppearancePreferencesSection";
import { LanguagePreferencesSection } from "@/modules/settings/components/preferences/LanguagePreferencesSection";
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader";

export function PreferencesSettingsPageContent() {
  const { locale, changeLocale } = useAppLocale();
  const { setTheme, theme } = useAppTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div>
      <SettingsPageHeader
        title="Preferencias"
        description="Personaliza el idioma del sitio y el modo de apariencia para que Spazio se adapte mejor a ti."
      />

      <LanguagePreferencesSection
        locale={locale}
        changeLocale={changeLocale}
      />

      <div className="my-10 border-t border-border/60" />

      <AppearancePreferencesSection
        theme={theme}
        setTheme={setTheme}
        reduceMotion={reduceMotion}
        setReduceMotion={setReduceMotion}
      />
    </div>
  );
}
