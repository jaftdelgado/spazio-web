"use client";

import * as React from "react";
import {
  Alert02Icon,
  Building03Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
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
import { HttpError } from "@lib/http/http-errors";
import { cn } from "@/lib/utils";
import {
  useModalities,
  usePropertyTypes,
} from "@catalogs/application/hooks/useCatalogs";
import { useCreateProperty } from "@properties/application/post/hooks/useCreateProperty";
import { ClausesSection } from "@properties/components/create/sections/clauses/ClausesSection";
import { PropertyDetailsSection } from "@properties/components/create/sections/details/PropertyDetailsSection";
import { GeneralSection } from "@properties/components/create/sections/general/GeneralSection";
import { LocationSection } from "@properties/components/create/sections/location/LocationSection";
import { validateLocationSection } from "@properties/components/create/sections/location/locationSection.schema";
import { MultimediaSection } from "@properties/components/create/sections/multimedia/MultimediaSection";
import { PricingSection } from "@properties/components/create/sections/pricing";
import {
  resolvePricingMode,
  validatePricingSection,
} from "@properties/components/create/sections/pricing/pricingSection.schema";
import { validatePropertyDetailsSection } from "@properties/components/create/sections/details/propertyDetailsSection.schema";
import { ServicesSection } from "@properties/components/create/sections/services";
import {
  resolvePropertyTypeKind,
  type PropertyTypeKind,
} from "@properties/components/create/propertyTypeKind";
import { validateGeneralSection } from "@properties/components/create/sections/general/generalSection.schema";
import {
  initialPropertyCreateFormState,
  type PhotoEntry,
  type PropertyCreateFormState,
  type PropertyCreateSectionId,
} from "@properties/components/create/types";
import type { CreatePropertyInput } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { uploadHttpAdapter } from "@uploads/infra/upload.http-adapter";

type PropertyCreateNavItem = {
  id: PropertyCreateSectionId;
  icon: IconSvgElement;
  labelKey: string;
};

const createNavItems: readonly PropertyCreateNavItem[] = [
  { id: "general", icon: Home09Icon, labelKey: "create.nav.general" },
  { id: "details", icon: Building03Icon, labelKey: "create.nav.details" },
  {
    id: "multimedia",
    icon: ImageUploadIcon,
    labelKey: "create.nav.multimedia",
  },
  { id: "location", icon: Location01Icon, labelKey: "create.nav.location" },
  { id: "pricing", icon: DollarCircleIcon, labelKey: "create.nav.pricing" },
  { id: "services", icon: PackageIcon, labelKey: "create.nav.services" },
  { id: "clauses", icon: NoteIcon, labelKey: "create.nav.clauses" },
] as const;

const createSectionOrder: readonly PropertyCreateSectionId[] = [
  "general",
  "details",
  "multimedia",
  "location",
  "pricing",
  "services",
  "clauses",
];

function getErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 401 || error.status === 403) {
      return "Tu sesion ya no permite registrar propiedades. Vuelve a iniciar sesion e intentalo de nuevo.";
    }

    if (error.status === 404) {
      return "No encontramos la propiedad recien creada para terminar de subir las fotos. Intentalo nuevamente.";
    }

    if (error.status >= 500) {
      return "Tuvimos un problema al guardar la propiedad. Intentalo de nuevo en unos minutos.";
    }

    const body = error.body as { error?: string } | null;
    if (body?.error && body.error.trim() !== "") {
      return body.error;
    }

    return "No pudimos completar el registro con la informacion capturada. Revisa los datos e intentalo otra vez.";
  }

  if (error instanceof TypeError) {
    return "Parece que la conexion se interrumpio. Revisa tu internet e intentalo nuevamente.";
  }

  if (error instanceof Error) {
    return "Ocurrio un problema al completar el registro. Intentalo nuevamente.";
  }

  return "Ocurrio un problema inesperado al completar el registro.";
}

function mapClausesForCreateInput(form: PropertyCreateFormState) {
  return form.clauses.map((entry) => {
    if (entry.value.type === "boolean") {
      return {
        clauseId: entry.clauseId,
        booleanValue: entry.value.value,
      };
    }

    if (entry.value.type === "range") {
      return {
        clauseId: entry.clauseId,
        minValue: entry.value.min ?? 0,
        maxValue: entry.value.max ?? 0,
      };
    }

    return {
      clauseId: entry.clauseId,
      integerValue: entry.value.value ?? 0,
    };
  });
}

function buildCreatePropertyInput(
  form: PropertyCreateFormState,
  propertyTypeKind: PropertyTypeKind,
  pricingMode: ReturnType<typeof resolvePricingMode>,
): CreatePropertyInput {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    propertyTypeId: form.propertyTypeId ?? 0,
    modalityId: form.modalityId ?? 0,
    lotArea: Number(form.lotArea),
    isFeatured: form.isFeatured,
    location: {
      cityId: form.cityId ?? 0,
      neighborhood: form.neighborhood.trim(),
      street: form.street.trim(),
      exteriorNumber: form.exteriorNumber.trim(),
      interiorNumber:
        form.interiorNumber.trim() === ""
          ? undefined
          : form.interiorNumber.trim(),
      postalCode: form.postalCode.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      isPublicAddress: form.isPublicAddress,
    },
    residential:
      propertyTypeKind === "residential"
        ? {
            bedrooms: Number(form.bedrooms),
            bathrooms: Number(form.bathrooms),
            beds: Number(form.beds),
            floors: Number(form.floors),
            parkingSpots: Number(form.parkingSpots),
            builtArea: Number(form.builtArea),
            constructionYear: Number(form.constructionYear),
            orientationId: form.orientationId ?? 0,
            isFurnished: form.isFurnished,
          }
        : undefined,
    commercial:
      propertyTypeKind === "commercial"
        ? {
            ceilingHeight: Number(form.ceilingHeight),
            loadingDocks: Number(form.loadingDocks),
            internalOffices: Number(form.internalOffices),
            threePhasePower: form.threePhasePower,
            landUse: form.landUse.trim(),
          }
        : undefined,
    salePrice:
      pricingMode === "sale" || pricingMode === "mixed"
        ? {
            salePrice: Number(form.salePrice),
            currency: "MXN",
            isNegotiable: form.salePriceIsNegotiable,
          }
        : undefined,
    rentPrices:
      pricingMode === "rent" || pricingMode === "mixed"
        ? form.enabledRentPeriodIds.map((periodId) => ({
            periodId,
            rentPrice: Number(form.rentPricesByPeriod[String(periodId)] ?? "0"),
            deposit: Number(form.rentDepositsByPeriod[String(periodId)] ?? "0"),
            currency: "MXN",
            isNegotiable: false,
          }))
        : undefined,
    services: form.serviceIds.length > 0 ? form.serviceIds : undefined,
    clauses:
      form.clauses.length > 0 ? mapClausesForCreateInput(form) : undefined,
  };
}

async function uploadPropertyPhotos(
  propertyUuid: string,
  photos: PhotoEntry[],
) {
  for (const [index, photo] of photos.entries()) {
    if (!photo.file) {
      continue;
    }

    await uploadHttpAdapter.uploadPropertyPhoto({
      propertyUuid,
      file: photo.file,
      label: photo.label,
      altText: photo.altText,
      sortOrder: index,
      isCover: photo.isCover,
    });
  }
}

type PropertyCreateCompletionState = {
  isGeneralSectionComplete: boolean;
  isPropertyDetailsSectionComplete: boolean;
  isMultimediaSectionComplete: boolean;
  isLocationSectionComplete: boolean;
  isPricingSectionComplete: boolean;
  hasServicesSelection: boolean;
  hasClausesSelection: boolean;
};

type SubmissionDialogState =
  | { open: false; status: null; message: string }
  | { open: true; status: "success" | "error"; message: string };

function getEnabledSections(
  completion: PropertyCreateCompletionState,
) {
  const unlocked = new Set<PropertyCreateSectionId>(["general"]);

  if (completion.isGeneralSectionComplete) {
    unlocked.add("details");
  }

  if (
    completion.isGeneralSectionComplete &&
    completion.isPropertyDetailsSectionComplete
  ) {
    unlocked.add("multimedia");
  }

  if (
    completion.isGeneralSectionComplete &&
    completion.isPropertyDetailsSectionComplete &&
    completion.isMultimediaSectionComplete
  ) {
    unlocked.add("location");
  }

  if (
    completion.isGeneralSectionComplete &&
    completion.isPropertyDetailsSectionComplete &&
    completion.isMultimediaSectionComplete &&
    completion.isLocationSectionComplete
  ) {
    unlocked.add("pricing");
  }

  if (
    completion.isGeneralSectionComplete &&
    completion.isPropertyDetailsSectionComplete &&
    completion.isMultimediaSectionComplete &&
    completion.isLocationSectionComplete &&
    completion.isPricingSectionComplete
  ) {
    unlocked.add("services");
  }

  if (
    completion.isGeneralSectionComplete &&
    completion.isPropertyDetailsSectionComplete &&
    completion.isMultimediaSectionComplete &&
    completion.isLocationSectionComplete &&
    completion.isPricingSectionComplete
  ) {
    unlocked.add("clauses");
  }

  return unlocked;
}

function getCanGoNext(
  activeSection: PropertyCreateSectionId,
  nextSection: PropertyCreateSectionId | null,
  completion: PropertyCreateCompletionState,
) {
  if (activeSection === "general") {
    return Boolean(nextSection) && completion.isGeneralSectionComplete;
  }

  if (activeSection === "details") {
    return Boolean(nextSection) && completion.isPropertyDetailsSectionComplete;
  }

  if (activeSection === "multimedia") {
    return Boolean(nextSection) && completion.isMultimediaSectionComplete;
  }

  if (activeSection === "location") {
    return Boolean(nextSection) && completion.isLocationSectionComplete;
  }

  if (activeSection === "pricing") {
    return Boolean(nextSection) && completion.isPricingSectionComplete;
  }

  if (activeSection === "services") {
    return Boolean(nextSection);
  }

  if (activeSection === "clauses") {
    return true;
  }

  return false;
}

export function PropertyCreatePageContent() {
  const { t } = usePropertiesTranslation();
  const router = useRouter();
  const createPropertyMutation = useCreateProperty();
  const modalitiesQuery = useModalities();
  const [activeSection, setActiveSection] =
    React.useState<PropertyCreateSectionId>("general");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [isSubmitConfirmDialogOpen, setIsSubmitConfirmDialogOpen] =
    React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionDialog, setSubmissionDialog] =
    React.useState<SubmissionDialogState>({
      open: false,
      status: null,
      message: "",
    });
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
        if (entry.kind === "new" && entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl);
        }
      });
    };
  }, []);

  const generalSectionValidation = React.useMemo(
    () => validateGeneralSection(form, t),
    [form, t],
  );
  const isGeneralSectionComplete = generalSectionValidation.success;
  const isMultimediaSectionComplete = form.photos.length > 0;
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
  const propertyTypesQuery = usePropertyTypes();
  const selectedPropertyTypeOption = React.useMemo(
    () =>
      (propertyTypesQuery.data ?? []).find(
        (propertyType) => propertyType.propertyTypeId === form.propertyTypeId,
      ) ?? null,
    [form.propertyTypeId, propertyTypesQuery.data],
  );
  const propertyTypeKind = React.useMemo(
    () => resolvePropertyTypeKind(selectedPropertyTypeOption),
    [selectedPropertyTypeOption],
  );
  const propertyDetailsSectionValidation = React.useMemo(
    () => validatePropertyDetailsSection(form, propertyTypeKind, t),
    [form, propertyTypeKind, t],
  );
  const isPropertyDetailsSectionComplete =
    form.propertyTypeId !== null && propertyDetailsSectionValidation.success;
  const pricingSectionValidation = React.useMemo(
    () => validatePricingSection(form, pricingMode, t),
    [form, pricingMode, t],
  );
  const isPricingSectionComplete = pricingSectionValidation.success;
  const hasServicesSelection = form.serviceIds.length > 0;
  const hasClausesSelection = form.clauses.length > 0;
  const completion = React.useMemo<PropertyCreateCompletionState>(
    () => ({
      isGeneralSectionComplete,
      isPropertyDetailsSectionComplete,
      isMultimediaSectionComplete,
      isLocationSectionComplete,
      isPricingSectionComplete,
      hasServicesSelection,
      hasClausesSelection,
    }),
    [
      hasClausesSelection,
      hasServicesSelection,
      isGeneralSectionComplete,
      isLocationSectionComplete,
      isMultimediaSectionComplete,
      isPropertyDetailsSectionComplete,
      isPricingSectionComplete,
    ],
  );

  const enabledSections = React.useMemo(() => {
    return getEnabledSections(completion);
  }, [completion]);

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
  const canGoNext = getCanGoNext(activeSection, nextSection, completion);

  function patchForm(patch: Partial<PropertyCreateFormState>) {
    setForm((current) => {
      const next = { ...current, ...patch };

      if (
        patch.modalityId !== undefined &&
        patch.modalityId !== current.modalityId
      ) {
        next.clauses = [];
      }

      if (
        patch.propertyTypeId !== undefined &&
        patch.propertyTypeId !== current.propertyTypeId
      ) {
        next.serviceIds = [];
      }

      return next;
    });

  }

  function handleSectionChange(sectionId: PropertyCreateSectionId) {
    if (!enabledSections.has(sectionId)) {
      return;
    }

    setActiveSection(sectionId);
  }

  function handleGoBack() {
    if (isSubmitting) {
      return;
    }

    if (!previousSection || !enabledSections.has(previousSection)) {
      return;
    }

    setActiveSection(previousSection);
  }

  function getSubmitConfirmationMessage() {
    const servicesEmpty = !completion.hasServicesSelection;
    const clausesEmpty = !completion.hasClausesSelection;

    if (servicesEmpty && clausesEmpty) {
      return t("create.submitDialog.bodyServicesAndClausesEmpty");
    }

    if (servicesEmpty) {
      return t("create.submitDialog.bodyServicesEmpty");
    }

    if (clausesEmpty) {
      return t("create.submitDialog.bodyClausesEmpty");
    }

    return t("create.submitDialog.body");
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    try {
      const payload = buildCreatePropertyInput(
        form,
        propertyTypeKind,
        pricingMode,
      );
      const result = await createPropertyMutation.mutateAsync(payload);

      if (form.photos.length > 0) {
        await uploadPropertyPhotos(result.propertyUuid, form.photos);
      }

      setIsSubmitConfirmDialogOpen(false);
      setSubmissionDialog({
        open: true,
        status: "success",
        message: t("create.resultDialog.successBody"),
      });
    } catch (error) {
      setIsSubmitConfirmDialogOpen(false);
      setSubmissionDialog({
        open: true,
        status: "error",
        message: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoNext() {
    if (isSubmitting) {
      return;
    }

    if (activeSection === "clauses") {
      setIsSubmitConfirmDialogOpen(true);
      return;
    }

    if (canGoNext && activeSection !== "services") {
      if (nextSection) {
        setActiveSection(nextSection);
      }
      return;
    }

    if (activeSection === "services") {
      if (nextSection) {
        setActiveSection(nextSection);
      }
    }
  }

  function renderActiveSection() {
    switch (activeSection) {
      case "general":
        return <GeneralSection form={form} patchForm={patchForm} />;
      case "details":
        return (
          <PropertyDetailsSection
            form={form}
            propertyTypeKind={propertyTypeKind}
            patchForm={patchForm}
          />
        );
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
        <aside
          className="hidden self-start xl:block xl:border-r xl:border-border xl:bg-background xl:pr-6"
          style={{
            position: "sticky",
            top: "var(--admin-topbar-height)",
          }}
        >
          <div className="bg-background pt-(--admin-page-padding-y)">
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
                        "h-10 w-full justify-start px-3 text-sm",
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
          </div>
        </aside>

        <main className="min-w-0 pb-8 xl:px-4">
          <div className="sticky top-(--admin-topbar-height) z-30 bg-background">
            <header className="flex flex-col gap-4 border-b border-border bg-background pt-(--admin-page-padding-y) pb-6 md:flex-row md:items-start md:justify-between">
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoBack}
                  >
                    {t("create.footer.previous")}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  {t("create.footer.cancel")}
                </Button>
                <Button
                  disabled={!canGoNext || isSubmitting}
                  type="button"
                  onClick={handleGoNext}
                >
                  {isSubmitting ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <HugeiconsIcon
                      icon={SaveIcon}
                      size={16}
                      strokeWidth={1.8}
                    />
                  )}
                  <span>
                    {isSubmitting
                      ? t("create.footer.saving")
                      : nextSection
                      ? t("create.footer.next")
                      : t("create.footer.save")}
                  </span>
                </Button>
              </div>
            </header>
          </div>

          <div>{renderActiveSection()}</div>
        </main>
      </div>

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.8} />
            </div>
            <AlertDialogTitle>
              {t("create.cancelDialog.title")}
            </AlertDialogTitle>
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
        open={isSubmitConfirmDialogOpen}
        onOpenChange={(open) => {
          if (isSubmitting) {
            return;
          }

          setIsSubmitConfirmDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={SaveIcon} size={20} strokeWidth={1.8} />
            </div>
            <AlertDialogTitle>
              {t("create.submitDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getSubmitConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {t("create.submitDialog.dismiss")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                if (isSubmitting) {
                  return;
                }

                void handleSubmit();
              }}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>{t("create.submitDialog.submitting")}</span>
                </span>
              ) : (
                t("create.submitDialog.confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={submissionDialog.open}
        onOpenChange={(open) => {
          setSubmissionDialog((current) =>
            open
              ? current
              : {
                  open: false,
                  status: null,
                  message: "",
                },
          );
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div
              className={cn(
                "mb-2 flex size-10 items-center justify-center rounded-2xl",
                submissionDialog.status === "success"
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              <HugeiconsIcon
                icon={
                  submissionDialog.status === "success"
                    ? CheckmarkCircle02Icon
                    : Alert02Icon
                }
                size={20}
                strokeWidth={1.8}
              />
            </div>
            <AlertDialogTitle>
              {submissionDialog.status === "success"
                ? t("create.resultDialog.successTitle")
                : t("create.resultDialog.errorTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {submissionDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {submissionDialog.status === "success" ? (
              <AlertDialogCancel>
                {t("create.resultDialog.successDismiss")}
              </AlertDialogCancel>
            ) : (
              <AlertDialogCancel>
                {t("create.resultDialog.errorDismiss")}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={() => {
                if (submissionDialog.status === "success") {
                  router.push(ROUTES.admin.properties);
                }
              }}
            >
              {submissionDialog.status === "success"
                ? t("create.resultDialog.successConfirm")
                : t("create.resultDialog.errorConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
