"use client";

import { useAppFont } from "@/app/font/FontProvider";
import { useAppLocale } from "@/app/i18n/useAppLocale";
import { useAppTheme } from "@/app/theme/ThemeProvider";
import { AppearancePreferencesSection } from "@/modules/settings/components/preferences/AppearancePreferencesSection";
import { LanguagePreferencesSection } from "@/modules/settings/components/preferences/LanguagePreferencesSection";
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

export function PreferencesSettingsPageContent() {
  const { t } = useUsersTranslation();
  const { locale, changeLocale } = useAppLocale();
  const { setUseDyslexicFont, useDyslexicFont } = useAppFont();
  const { setTheme, theme } = useAppTheme();

  return (
    <div>
      <SettingsPageHeader
        title={t("preferences.header.title")}
        description={t("preferences.header.description")}
      />

      <LanguagePreferencesSection
        locale={locale}
        changeLocale={changeLocale}
      />

      <div className="my-10 border-t border-border/60" />

      <AppearancePreferencesSection
        theme={theme}
        setTheme={setTheme}
        useDyslexicFont={useDyslexicFont}
        setUseDyslexicFont={setUseDyslexicFont}
      />
    </div>
  );
}
