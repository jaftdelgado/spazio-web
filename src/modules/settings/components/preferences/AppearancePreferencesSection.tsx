"use client";

import {
  ComputerPhoneSyncIcon,
  ViewIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";

import type { AppTheme } from "@/app/theme/config";
import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "@/modules/settings/components/SettingsSection";
import { PreferenceCard } from "@/modules/settings/components/preferences/PreferenceCard";
import { SegmentedControl } from "@/modules/settings/components/preferences/SegmentedControl";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

type AppearancePreferencesSectionProps = {
  setUseDyslexicFont: (value: boolean) => void;
  setTheme: (theme: AppTheme) => void;
  theme: AppTheme;
  useDyslexicFont: boolean;
};

export function AppearancePreferencesSection({
  setUseDyslexicFont,
  setTheme,
  theme,
  useDyslexicFont,
}: AppearancePreferencesSectionProps) {
  const { t } = useUsersTranslation();

  return (
    <SettingsSection
      title={t("preferences.appearance.sectionTitle")}
      hint={t("preferences.appearance.sectionHint")}
    >
      <PreferenceCard
        icon={
          theme === "dark"
            ? Moon02Icon
            : theme === "light"
              ? Sun03Icon
              : ComputerPhoneSyncIcon
        }
        title={t("preferences.appearance.themeTitle")}
        description={t("preferences.appearance.themeDescription")}
      >
        <SegmentedControl
          options={[
            {
              label: t("preferences.appearance.themeOptions.system"),
              active: theme === "system",
              onClick: () => setTheme("system" satisfies AppTheme),
            },
            {
              label: t("preferences.appearance.themeOptions.light"),
              active: theme === "light",
              onClick: () => setTheme("light" satisfies AppTheme),
            },
            {
              label: t("preferences.appearance.themeOptions.dark"),
              active: theme === "dark",
              onClick: () => setTheme("dark" satisfies AppTheme),
            },
          ]}
        />
      </PreferenceCard>

      <PreferenceCard
        icon={ViewIcon}
        title={t("preferences.appearance.fontTitle")}
        description={t("preferences.appearance.fontDescription")}
      >
        <Switch
          checked={useDyslexicFont}
          onCheckedChange={(checked) => setUseDyslexicFont(Boolean(checked))}
        />
      </PreferenceCard>
    </SettingsSection>
  );
}
