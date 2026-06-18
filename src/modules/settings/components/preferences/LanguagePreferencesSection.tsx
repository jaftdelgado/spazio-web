"use client";

import { Globe02Icon } from "@hugeicons/core-free-icons";

import type { AppLocale } from "@/app/i18n/config";
import { SettingsSection } from "@/modules/settings/components/SettingsSection";
import { PreferenceCard } from "@/modules/settings/components/preferences/PreferenceCard";
import { SegmentedControl } from "@/modules/settings/components/preferences/SegmentedControl";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

type LanguagePreferencesSectionProps = {
  changeLocale: (locale: AppLocale) => Promise<void>;
  locale: AppLocale;
};

export function LanguagePreferencesSection({
  changeLocale,
  locale,
}: LanguagePreferencesSectionProps) {
  const { t } = useUsersTranslation();

  return (
    <SettingsSection
      title={t("preferences.language.sectionTitle")}
      hint={t("preferences.language.sectionHint")}
    >
      <PreferenceCard
        icon={Globe02Icon}
        title={t("preferences.language.cardTitle")}
        description={t("preferences.language.cardDescription")}
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
