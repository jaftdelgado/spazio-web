"use client";

import { Globe02Icon } from "@hugeicons/core-free-icons";

import type { AppLocale } from "@/app/i18n/config";
import { SettingsSection } from "@/modules/settings/components/SettingsSection";
import { PreferenceCard } from "@/modules/settings/components/preferences/PreferenceCard";
import { SegmentedControl } from "@/modules/settings/components/preferences/SegmentedControl";

type LanguagePreferencesSectionProps = {
  changeLocale: (locale: AppLocale) => Promise<void>;
  locale: AppLocale;
};

export function LanguagePreferencesSection({
  changeLocale,
  locale,
}: LanguagePreferencesSectionProps) {
  return (
    <SettingsSection
      title="Idioma del sitio"
      hint="Elige como quieres ver el contenido principal de la plataforma."
    >
      <PreferenceCard
        icon={Globe02Icon}
        title="Idioma"
        description="Cambia entre español e inglés para toda la interfaz."
      >
        <SegmentedControl
          options={[
            {
              label: "ES",
              active: locale === "es",
              onClick: () => void changeLocale("es" satisfies AppLocale),
            },
            {
              label: "EN",
              active: locale === "en",
              onClick: () => void changeLocale("en" satisfies AppLocale),
            },
          ]}
        />
      </PreferenceCard>
    </SettingsSection>
  );
}
