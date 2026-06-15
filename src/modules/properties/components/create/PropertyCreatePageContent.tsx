"use client";

import * as React from "react";
import {
  Cancel01Icon,
  DollarCircleIcon,
  Home09Icon,
  ImageUploadIcon,
  Location01Icon,
  NoteIcon,
  PackageIcon,
  SaveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { ClausesSection } from "@properties/components/create/sections/clauses/ClausesSection";
import { GeneralSection } from "@properties/components/create/sections/general/GeneralSection";
import { LocationSection } from "@properties/components/create/sections/location/LocationSection";
import { MultimediaSection } from "@properties/components/create/sections/multimedia/MultimediaSection";
import { PricingSection } from "@properties/components/create/sections/pricing";
import { ServicesSection } from "@properties/components/create/sections/services";
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
  { id: "services", icon: PackageIcon, labelKey: "create.nav.services" },
  { id: "clauses", icon: NoteIcon, labelKey: "create.nav.clauses" },
  {
    id: "multimedia",
    icon: ImageUploadIcon,
    labelKey: "create.nav.multimedia",
  },
] as const;

export function PropertyCreatePageContent() {
  const { t } = usePropertiesTranslation();
  const router = useRouter();
  const [activeSection, setActiveSection] =
    React.useState<PropertyCreateSectionId>("general");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<PropertyCreateFormState>(
    initialPropertyCreateFormState,
  );
  const photosRef = React.useRef(form.photos);

  React.useEffect(() => {
    photosRef.current = form.photos;
  }, [form.photos]);

  React.useEffect(() => {
    return () => {
      photosRef.current.forEach((entry) => {
        URL.revokeObjectURL(entry.previewUrl);
      });
    };
  }, []);

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
      case "services":
        return <ServicesSection form={form} patchForm={patchForm} />;
      case "clauses":
        return <ClausesSection form={form} patchForm={patchForm} />;
      case "multimedia":
        return <MultimediaSection form={form} patchForm={patchForm} />;
      default:
        return null;
    }
  }

  return (
    <div className="admin-page-view flex min-h-full flex-col bg-background text-foreground">
      <div className="grid w-full gap-8 xl:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="xl:border-r xl:border-border xl:py-8 xl:pr-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {t("create.sidebar.eyebrow")}
          </div>
          <div className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
            {form.title || t("create.page.title")}
          </div>

          <ul className="mt-6 flex flex-col gap-1">
            {createNavItems.map(({ id, icon, labelKey }) => {
              const isActive = id === activeSection;

              return (
                <li key={id}>
                  <Button
                    className={cn(
                      "h-10 w-full justify-start rounded-2xl px-3 text-sm",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => setActiveSection(id)}
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
          <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {activeNav ? t(activeNav.labelKey) : t("create.page.title")}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t(`create.sectionDescriptions.${activeSection}`)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                {t("create.footer.cancel")}
              </Button>
              <Button disabled={!isDirty} type="button">
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

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={20}
                  strokeWidth={1.8}
                />
            </div>
            <AlertDialogTitle>{t("create.cancelDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("create.cancelDialog.body")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("create.cancelDialog.dismiss")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push(ROUTES.admin.properties)}
            >
              {t("create.cancelDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
