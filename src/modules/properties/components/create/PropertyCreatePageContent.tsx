"use client";

import * as React from "react";
import {
  DollarCircleIcon,
  Home09Icon,
  ImageUploadIcon,
  Location01Icon,
  NoteIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button, Description } from "@heroui/react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { GeneralSection } from "@properties/components/create/sections/GeneralSection";
import { LocationSection } from "@properties/components/create/sections/LocationSection";
import { MediaSection } from "@properties/components/create/sections/MediaSection";
import { NotesSection } from "@properties/components/create/sections/NotesSection";
import { PricingSection } from "@properties/components/create/sections/PricingSection";
import { SettingsSection } from "@properties/components/create/sections/SettingsSection";
import {
  initialPropertyCreateFormState,
  type PropertyCreateFormState,
  type PropertyCreateSectionId,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertyCreateNavItem = {
  id: PropertyCreateSectionId;
  icon: IconSvgElement;
  labelKey: string;
};

const createNavItems: readonly PropertyCreateNavItem[] = [
  { id: "general", icon: Home09Icon, labelKey: "create.nav.general" },
  { id: "location", icon: Location01Icon, labelKey: "create.nav.location" },
  { id: "pricing", icon: DollarCircleIcon, labelKey: "create.nav.pricing" },
  { id: "media", icon: ImageUploadIcon, labelKey: "create.nav.media" },
  { id: "settings", icon: Settings02Icon, labelKey: "create.nav.settings" },
  { id: "notes", icon: NoteIcon, labelKey: "create.nav.notes" },
] as const;

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PropertyCreatePageContent() {
  const { t } = usePropertiesTranslation();
  const router = useRouter();
  const [activeSection, setActiveSection] =
    React.useState<PropertyCreateSectionId>("general");
  const [form, setForm] = React.useState<PropertyCreateFormState>(
    initialPropertyCreateFormState,
  );

  const isDirty = React.useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialPropertyCreateFormState),
    [form],
  );

  const activeNav = createNavItems.find((item) => item.id === activeSection);

  function patchForm(patch: Partial<PropertyCreateFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function renderActiveSection() {
    switch (activeSection) {
      case "general":
        return <GeneralSection form={form} patchForm={patchForm} />;
      case "location":
        return <LocationSection form={form} patchForm={patchForm} />;
      case "pricing":
        return <PricingSection form={form} patchForm={patchForm} />;
      case "media":
        return <MediaSection form={form} patchForm={patchForm} />;
      case "settings":
        return <SettingsSection form={form} patchForm={patchForm} />;
      case "notes":
        return <NotesSection form={form} patchForm={patchForm} />;
      default:
        return null;
    }
  }

  return (
    <div className="admin-page-view flex min-h-full flex-col">
      <div className="grid w-full gap-8 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="xl:border-r xl:border-slate-200/80 xl:py-8 xl:pr-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {t("create.sidebar.eyebrow")}
          </div>
          <div className="mt-1 truncate text-lg font-semibold text-slate-950">
            {form.title || t("create.page.title")}
          </div>

          <ul className="mt-6 flex flex-col gap-1">
            {createNavItems.map(({ id, icon, labelKey }) => {
              const isActive = id === activeSection;

              return (
                <li key={id}>
                  <Button
                    className={cn(
                      "h-9 w-full justify-start rounded-md px-2.5 text-sm",
                      isActive
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-muted hover:bg-foreground/[0.03] hover:text-foreground",
                    )}
                    onPress={() => setActiveSection(id)}
                    variant="ghost"
                  >
                    <HugeiconsIcon
                      className="opacity-70"
                      icon={icon}
                      size={16}
                      strokeWidth={1.8}
                    />
                    <span>{t(labelKey)}</span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="min-w-0 py-8 pb-32 xl:px-4">
          <header className="border-b border-slate-200/80 pb-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
              {t("create.header.eyebrow", {
                section: activeNav ? t(activeNav.labelKey) : "",
              })}
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">
              {activeNav ? t(activeNav.labelKey) : t("create.page.title")}
            </h1>
            <Description className="mt-1 text-sm">
              {t(`create.sectionDescriptions.${activeSection}`)}
            </Description>
          </header>

          {renderActiveSection()}
        </main>
      </div>

      <div className="sticky bottom-0 z-20 mt-8 border-t border-slate-200/80 bg-background/90 backdrop-blur">
        <div className="flex items-center justify-between gap-3 py-3">
          <Description className="font-mono text-[10px] uppercase tracking-[0.3em]">
            {isDirty ? t("create.footer.dirty") : t("create.footer.clean")}
          </Description>
          <div className="flex items-center gap-2">
            <Button
              isDisabled={!isDirty}
              variant="ghost"
              onPress={() => setForm(initialPropertyCreateFormState)}
            >
              {t("create.footer.discard")}
            </Button>
            <Button
              variant="secondary"
              onPress={() => router.push(ROUTES.admin.properties)}
            >
              {t("create.footer.cancel")}
            </Button>
            <Button isDisabled={!isDirty}>{t("create.footer.save")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
