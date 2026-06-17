"use client";

import {
  ComputerPhoneSyncIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";

import type { AppTheme } from "@/app/theme/config";
import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "@/modules/settings/components/SettingsSection";
import { PreferenceCard } from "@/modules/settings/components/preferences/PreferenceCard";
import { SegmentedControl } from "@/modules/settings/components/preferences/SegmentedControl";

type AppearancePreferencesSectionProps = {
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  setTheme: (theme: AppTheme) => void;
  theme: AppTheme;
};

export function AppearancePreferencesSection({
  reduceMotion,
  setReduceMotion,
  setTheme,
  theme,
}: AppearancePreferencesSectionProps) {
  return (
    <SettingsSection
      title="Apariencia"
      hint="Define como quieres que se vea el sitio en tu dispositivo."
    >
      <PreferenceCard
        icon={
          theme === "dark"
            ? Moon02Icon
            : theme === "light"
              ? Sun03Icon
              : ComputerPhoneSyncIcon
        }
        title="Tema"
        description="Selecciona entre claro, oscuro o el modo del sistema."
      >
        <SegmentedControl
          options={[
            {
              label: "SIS",
              active: theme === "system",
              onClick: () => setTheme("system" satisfies AppTheme),
            },
            {
              label: "CL",
              active: theme === "light",
              onClick: () => setTheme("light" satisfies AppTheme),
            },
            {
              label: "OSC",
              active: theme === "dark",
              onClick: () => setTheme("dark" satisfies AppTheme),
            },
          ]}
        />
      </PreferenceCard>

      <PreferenceCard
        icon={ComputerPhoneSyncIcon}
        title="Reducir movimiento"
        description="Minimiza transiciones decorativas en futuras pantallas del sitio."
      >
        <Switch
          checked={reduceMotion}
          onCheckedChange={(checked) => setReduceMotion(Boolean(checked))}
        />
      </PreferenceCard>
    </SettingsSection>
  );
}
