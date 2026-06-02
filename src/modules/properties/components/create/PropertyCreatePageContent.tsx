"use client";

import * as React from "react";
import {
  Cancel01Icon,
  DollarCircleIcon,
  Home09Icon,
  ImageUploadIcon,
  Location01Icon,
  NoteIcon,
  SaveIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { AlertDialog, Button, Description } from "@heroui/react";
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
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
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

        <main className="min-w-0 py-8 xl:px-4">
          <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">
                {activeNav ? t(activeNav.labelKey) : t("create.page.title")}
              </h1>
              <Description className="mt-1 text-sm">
                {t(`create.sectionDescriptions.${activeSection}`)}
              </Description>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onPress={() => setIsCancelDialogOpen(true)}
              >
                {t("create.footer.cancel")}
              </Button>
              <Button isDisabled={!isDirty}>
                <HugeiconsIcon
                  icon={SaveIcon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>{t("create.footer.save")}</span>
              </Button>
            </div>
          </header>

          {renderActiveSection()}
        </main>
      </div>

      <AlertDialog.Backdrop
        isOpen={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-105">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="warning">
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={20}
                  strokeWidth={1.8}
                />
              </AlertDialog.Icon>
              <AlertDialog.Heading>
                {t("create.cancelDialog.title")}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>{t("create.cancelDialog.body")}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                {t("create.cancelDialog.dismiss")}
              </Button>
              <Button
                slot="close"
                variant="secondary"
                onPress={() => router.push(ROUTES.admin.properties)}
              >
                {t("create.cancelDialog.confirm")}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </div>
  );
}
