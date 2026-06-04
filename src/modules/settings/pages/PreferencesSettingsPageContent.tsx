"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import {
  ComputerPhoneSyncIcon,
  Globe02Icon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { AppLocale } from "@/app/i18n/config";
import type { AppTheme } from "@/app/theme/config";
import { useAppLocale } from "@/app/i18n/useAppLocale";
import { useAppTheme } from "@/app/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader";
import { SettingsSection } from "@/modules/settings/components/SettingsSection";

export function PreferencesSettingsPageContent() {
  const { locale, changeLocale } = useAppLocale();
  const { setTheme, theme } = useAppTheme();
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div>
      <SettingsPageHeader
        eyebrow="Settings · Preferencias"
        title="Preferencias"
        description="Personaliza el idioma del sitio y el modo de apariencia para que Spazio se adapte mejor a ti."
      />

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
              { label: "ES", active: locale === "es", onClick: () => void changeLocale("es" satisfies AppLocale) },
              { label: "EN", active: locale === "en", onClick: () => void changeLocale("en" satisfies AppLocale) },
            ]}
          />
        </PreferenceCard>
      </SettingsSection>

      <div className="my-10 border-t border-border/60" />

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
    </div>
  );
}

function PreferenceCard({
  children,
  description,
  icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: typeof Globe02Icon;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-3xl border bg-card px-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <HugeiconsIcon icon={icon} size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SegmentedControl({
  options,
}: {
  options: Array<{
    active: boolean;
    label: string;
    onClick: () => void;
  }>;
}) {
  return (
    <div className="inline-flex items-center rounded-full border bg-muted/60 p-0.5">
      {options.map((option) => (
        <Button
          key={option.label}
          type="button"
          variant="ghost"
          size="xs"
          onClick={option.onClick}
          className={
            option.active
              ? "rounded-full bg-background text-foreground shadow-sm hover:bg-background"
              : "rounded-full text-muted-foreground hover:text-foreground"
          }
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
