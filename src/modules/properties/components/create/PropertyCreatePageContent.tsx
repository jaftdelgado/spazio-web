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
import { useModalities } from "@catalogs/application/hooks/useCatalogs";
import { ClausesSection } from "@properties/components/create/sections/clauses/ClausesSection";
import { GeneralSection } from "@properties/components/create/sections/general/GeneralSection";
import { LocationSection } from "@properties/components/create/sections/location/LocationSection";
import { validateLocationSection } from "@properties/components/create/sections/location/locationSection.schema";
import { MultimediaSection } from "@properties/components/create/sections/multimedia/MultimediaSection";
import { PricingSection } from "@properties/components/create/sections/pricing";
import {
  resolvePricingMode,
  validatePricingSection,
} from "@properties/components/create/sections/pricing/pricingSection.schema";
import { ServicesSection } from "@properties/components/create/sections/services";
import { validateGeneralSection } from "@properties/components/create/sections/general/generalSection.schema";
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

const createSectionOrder: readonly PropertyCreateSectionId[] = [
  "general",
  "location",
  "pricing",
  "services",
  "clauses",
  "multimedia",
];

export function PropertyCreatePageContent() {
  const { t } = usePropertiesTranslation();
  const router = useRouter();
  const modalitiesQuery = useModalities();
  const [activeSection, setActiveSection] =
    React.useState<PropertyCreateSectionId>("general");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [isEmptyServicesDialogOpen, setIsEmptyServicesDialogOpen] =
    React.useState(false);
  const [hasConfirmedEmptyServices, setHasConfirmedEmptyServices] =
    React.useState(false);
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
  const generalSectionValidation = React.useMemo(
    () => validateGeneralSection(form, t),
    [form, t],
  );
  const isGeneralSectionComplete = generalSectionValidation.success;
  const locationSectionValidation = React.useMemo(
    () => validateLocationSection(form, t),
    [form, t],
  );
  const isLocationSectionComplete = locationSectionValidation.success;
  const selectedModalityName = React.useMemo(
    () =>
      (modalitiesQuery.data ?? []).find(
        (modality) => modality.modalityId === form.modalityId,
      )?.name ?? null,
    [form.modalityId, modalitiesQuery.data],
  );
  const pricingMode = React.useMemo(
    () => resolvePricingMode(selectedModalityName),
    [selectedModalityName],
  );
  const pricingSectionValidation = React.useMemo(
    () => validatePricingSection(form, pricingMode, t),
    [form, pricingMode, t],
  );
  const isPricingSectionComplete = pricingSectionValidation.success;
  const hasServicesSelection = form.serviceIds.length > 0;

  React.useEffect(() => {
    if (hasServicesSelection) {
      setHasConfirmedEmptyServices(false);
    }
  }, [hasServicesSelection]);

  const enabledSections = React.useMemo(() => {
    const unlocked = new Set<PropertyCreateSectionId>(["general"]);

    if (isGeneralSectionComplete) {
      unlocked.add("location");
    }

    if (isGeneralSectionComplete && isLocationSectionComplete) {
      unlocked.add("pricing");
    }

    if (
      isGeneralSectionComplete &&
      isLocationSectionComplete &&
      isPricingSectionComplete
    ) {
      unlocked.add("services");
    }

    if (
      isGeneralSectionComplete &&
      isLocationSectionComplete &&
      isPricingSectionComplete &&
      (hasServicesSelection || hasConfirmedEmptyServices)
    ) {
      unlocked.add("clauses");
    }

    return unlocked;
  }, [
    hasServicesSelection,
    isGeneralSectionComplete,
    hasConfirmedEmptyServices,
    isLocationSectionComplete,
    isPricingSectionComplete,
  ]);

  const activeNav = createNavItems.find((item) => item.id === activeSection);
  const activeSectionIndex = createSectionOrder.indexOf(activeSection);
  const previousSection =
    activeSectionIndex > 0 ? createSectionOrder[activeSectionIndex - 1] : null;
  const nextSection =
    activeSectionIndex >= 0 &&
    activeSectionIndex < createSectionOrder.length - 1
      ? createSectionOrder[activeSectionIndex + 1]
      : null;
  const canGoBack =
    previousSection !== null && enabledSections.has(previousSection);
  const canGoNext =
    activeSection === "general"
      ? Boolean(nextSection) && isGeneralSectionComplete
      : activeSection === "location"
        ? Boolean(nextSection) && isLocationSectionComplete
        : activeSection === "pricing"
          ? Boolean(nextSection) && isPricingSectionComplete
          : activeSection === "services"
            ? Boolean(nextSection)
      : false;

  function patchForm(patch: Partial<PropertyCreateFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function handleSectionChange(sectionId: PropertyCreateSectionId) {
    if (!enabledSections.has(sectionId)) {
      return;
    }

    setActiveSection(sectionId);
  }

  function handleGoBack() {
    if (!previousSection || !enabledSections.has(previousSection)) {
      return;
    }

    setActiveSection(previousSection);
  }

  function handleGoNext() {
    if (!nextSection) {
      return;
    }

    if (
      (activeSection === "general" && isGeneralSectionComplete) ||
      (activeSection === "location" && isLocationSectionComplete) ||
      (activeSection === "pricing" && isPricingSectionComplete)
    ) {
      setActiveSection(nextSection);
      return;
    }

    if (activeSection === "services") {
      if (hasServicesSelection) {
        setHasConfirmedEmptyServices(false);
        setActiveSection(nextSection);
        return;
      }

      setIsEmptyServicesDialogOpen(true);
    }
  }

  function handleConfirmEmptyServices() {
    if (!nextSection) {
      return;
    }

    setHasConfirmedEmptyServices(true);
    setIsEmptyServicesDialogOpen(false);
    setActiveSection(nextSection);
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
              const isEnabled = enabledSections.has(id);

              return (
                <li key={id}>
                  <Button
                    className={cn(
                      "h-10 w-full justify-start rounded-2xl px-3 text-sm",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20"
                        : !isEnabled
                          ? "text-muted-foreground/50"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    disabled={!isEnabled}
                    onClick={() => handleSectionChange(id)}
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
              {canGoBack ? (
                <Button type="button" variant="outline" onClick={handleGoBack}>
                  {t("create.footer.previous")}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                {t("create.footer.cancel")}
              </Button>
              <Button disabled={!canGoNext} type="button" onClick={handleGoNext}>
                <HugeiconsIcon
                  icon={SaveIcon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>{t("create.footer.next")}</span>
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

      <AlertDialog
        open={isEmptyServicesDialogOpen}
        onOpenChange={setIsEmptyServicesDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HugeiconsIcon
                icon={PackageIcon}
                size={20}
                strokeWidth={1.8}
              />
            </div>
            <AlertDialogTitle>
              {t("create.servicesEmptyDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("create.servicesEmptyDialog.body")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("create.servicesEmptyDialog.dismiss")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEmptyServices}>
              {t("create.servicesEmptyDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
