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
import { useQueryClient } from "@tanstack/react-query";

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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { HttpError } from "@lib/http/http-errors";
import { cn } from "@/lib/utils";
import {
  useModalities,
  usePropertyTypes,
} from "@catalogs/application/hooks/useCatalogs";
import { usePropertyClauses } from "@properties/application/clauses/hooks/usePropertyClauses";
import {
  clearEditingPropertyUuid,
  readEditingPropertyUuid,
} from "@properties/application/edit/property-edit-session";
import { useProperty } from "@properties/application/get/hooks/useProperty";
import { usePropertyPhotos } from "@properties/application/photos/hooks/usePropertyPhotos";
import { usePropertyPrices } from "@properties/application/prices/hooks/usePropertyPrices";
import { usePropertyServices } from "@properties/application/services/hooks/usePropertyServices";
import { ClausesSection } from "@properties/components/create/sections/clauses/ClausesSection";
import { PropertyDetailsSection } from "@properties/components/create/sections/details/PropertyDetailsSection";
import { validatePropertyDetailsSection } from "@properties/components/create/sections/details/propertyDetailsSection.schema";
import { GeneralSection } from "@properties/components/create/sections/general/GeneralSection";
import { validateGeneralSection } from "@properties/components/create/sections/general/generalSection.schema";
import { LocationSection } from "@properties/components/create/sections/location/LocationSection";
import { validateLocationSection } from "@properties/components/create/sections/location/locationSection.schema";
import { MultimediaSection } from "@properties/components/create/sections/multimedia/MultimediaSection";
import { PricingSection } from "@properties/components/create/sections/pricing";
import {
  resolvePricingMode,
  validatePricingSection,
} from "@properties/components/create/sections/pricing/pricingSection.schema";
import { ServicesSection } from "@properties/components/create/sections/services";
import {
  resolvePropertyTypeKind,
  type PropertyTypeKind,
} from "@properties/components/create/propertyTypeKind";
import {
  initialPropertyEditFormState,
  type PhotoEntry,
  type PropertyEditFormState,
  type PropertyEditSectionId,
} from "@properties/components/edit/types";
import type {
  PropertyClause,
  PropertyDetail,
  PropertyPhoto,
  PropertyPrices,
  PropertyServices,
  UpdatePropertyClausesInput,
  UpdatePropertyInput,
  UpdatePropertyPhotosInput,
  UpdatePropertyPricesInput,
  UpdatePropertyServicesInput,
} from "@properties/domain/property.entity";
import { propertyClausesHttpAdapter } from "@properties/infra/clauses/property-clauses.http-adapter";
import { propertyPatchHttpAdapter } from "@properties/infra/patch/property-patch.http-adapter";
import { propertyPhotosHttpAdapter } from "@properties/infra/photos/property-photos.http-adapter";
import { propertyPricesHttpAdapter } from "@properties/infra/prices/property-prices.http-adapter";
import { propertyServicesHttpAdapter } from "@properties/infra/services/property-services.http-adapter";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { uploadHttpAdapter } from "@uploads/infra/upload.http-adapter";

type PropertyEditNavItem = {
  id: PropertyEditSectionId;
  icon: IconSvgElement;
  labelKey: string;
};

type SubmissionDialogState =
  | { open: false; status: null; message: string }
  | { open: true; status: "success" | "error"; message: string };

type PropertyEditCompletionState = {
  isGeneralSectionComplete: boolean;
  isPropertyDetailsSectionComplete: boolean;
  isMultimediaSectionComplete: boolean;
  isLocationSectionComplete: boolean;
  isPricingSectionComplete: boolean;
  hasServicesSelection: boolean;
  hasClausesSelection: boolean;
};

type PropertyEditBootstrapData = {
  detail: PropertyDetail;
  services: PropertyServices;
  prices: PropertyPrices;
  clauses: PropertyClause[];
  photos: PropertyPhoto[];
};

const editNavItems: readonly PropertyEditNavItem[] = [
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

const editSectionOrder: readonly PropertyEditSectionId[] = [
  "general",
  "details",
  "multimedia",
  "location",
  "pricing",
  "services",
  "clauses",
];

function getUpdateErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 401 || error.status === 403) {
      return "Tu sesion ya no permite modificar propiedades. Vuelve a iniciar sesion e intentalo de nuevo.";
    }

    if (error.status === 404) {
      return "No encontramos la propiedad seleccionada para completar la edicion.";
    }

    if (error.status >= 500) {
      return "Tuvimos un problema al guardar los cambios de la propiedad. Intentalo de nuevo en unos minutos.";
    }

    const body = error.body as { error?: string } | null;
    if (body?.error && body.error.trim() !== "") {
      return body.error;
    }

    return "No pudimos guardar los cambios con la informacion capturada. Revisa los datos e intentalo otra vez.";
  }

  if (error instanceof TypeError) {
    return "Parece que la conexion se interrumpio. Revisa tu internet e intentalo nuevamente.";
  }

  return "Ocurrio un problema inesperado al guardar los cambios.";
}

function mapStoredClauseValue(clause: PropertyClause) {
  if (clause.booleanValue !== null) {
    return { type: "boolean" as const, value: clause.booleanValue };
  }

  if (clause.minValue !== null || clause.maxValue !== null) {
    return {
      type: "range" as const,
      min: clause.minValue,
      max: clause.maxValue,
    };
  }

  return { type: "integer" as const, value: clause.integerValue };
}

function mapExistingPhotos(photos: PropertyPhoto[]): PhotoEntry[] {
  return photos.map((photo) => ({
    kind: "existing",
    photoId: photo.photoId,
    storageKey: photo.storageKey,
    previewUrl: photo.url,
    label: photo.label ?? "",
    altText: photo.altText ?? "",
    isCover: photo.isCover,
  }));
}

function resolveInitialFormState(
  data: PropertyEditBootstrapData,
): PropertyEditFormState {
  const { detail, services, prices, clauses, photos } = data;

  return {
    ...initialPropertyEditFormState,
    title: detail.title,
    propertyTypeId: detail.propertyTypeId,
    modalityId: detail.modalityId,
    description: detail.description,
    countryId: detail.location?.countryId ?? null,
    stateId: detail.location?.stateId ?? null,
    cityId: detail.location?.cityId ?? null,
    city: detail.location?.cityName ?? "",
    latitude: detail.location ? String(detail.location.latitude) : "",
    longitude: detail.location ? String(detail.location.longitude) : "",
    neighborhood: detail.location?.neighborhood ?? "",
    street: detail.location?.street ?? "",
    exteriorNumber: detail.location?.exteriorNumber ?? "",
    interiorNumber: detail.location?.interiorNumber ?? "",
    postalCode: detail.location?.postalCode ?? "",
    lotArea: String(detail.lotArea),
    bedrooms: detail.residential ? String(detail.residential.bedrooms) : "",
    bathrooms: detail.residential ? String(detail.residential.bathrooms) : "",
    beds: detail.residential ? String(detail.residential.beds) : "",
    floors: detail.residential ? String(detail.residential.floors) : "",
    parkingSpots: detail.residential
      ? String(detail.residential.parkingSpots)
      : "",
    builtArea: detail.residential ? String(detail.residential.builtArea) : "",
    constructionYear: detail.residential
      ? String(detail.residential.constructionYear)
      : "",
    orientationId: detail.residential?.orientationId ?? null,
    isFurnished: detail.residential?.isFurnished ?? false,
    ceilingHeight: detail.commercial
      ? String(detail.commercial.ceilingHeight)
      : "",
    loadingDocks: detail.commercial
      ? String(detail.commercial.loadingDocks)
      : "",
    internalOffices: detail.commercial
      ? String(detail.commercial.internalOffices)
      : "",
    threePhasePower: detail.commercial?.threePhasePower ?? false,
    landUse: detail.commercial?.landUse ?? "",
    salePrice: prices.salePrice ? String(prices.salePrice.salePrice) : "",
    salePriceIsNegotiable: prices.salePrice?.isNegotiable ?? false,
    rentPricesByPeriod: Object.fromEntries(
      prices.rentPrices.map((rentPrice) => [
        String(rentPrice.periodId),
        String(rentPrice.rentPrice),
      ]),
    ),
    rentDepositsByPeriod: Object.fromEntries(
      prices.rentPrices.map((rentPrice) => [
        String(rentPrice.periodId),
        String(rentPrice.deposit ?? 0),
      ]),
    ),
    enabledRentPeriodIds: prices.rentPrices.map(
      (rentPrice) => rentPrice.periodId,
    ),
    serviceIds: services.serviceIds,
    clauses: clauses.map((clause) => ({
      clauseId: clause.clauseId,
      value: mapStoredClauseValue(clause),
    })),
    photos: mapExistingPhotos(photos),
    isPublicAddress: detail.location?.isPublicAddress ?? true,
    isFeatured: detail.isFeatured,
  };
}

function buildUpdatePropertyInput(
  form: PropertyEditFormState,
  propertyTypeKind: PropertyTypeKind,
): UpdatePropertyInput {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
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
  };
}

function buildUpdatePricesInput(
  form: PropertyEditFormState,
  pricingMode: ReturnType<typeof resolvePricingMode>,
): UpdatePropertyPricesInput {
  return {
    salePrice:
      pricingMode === "sale" || pricingMode === "mixed"
        ? {
            salePrice: Number(form.salePrice),
            isNegotiable: form.salePriceIsNegotiable,
          }
        : undefined,
    rentPrices:
      pricingMode === "rent" || pricingMode === "mixed"
        ? form.enabledRentPeriodIds.map((periodId) => ({
            periodId,
            rentPrice: Number(form.rentPricesByPeriod[String(periodId)] ?? "0"),
            deposit: Number(form.rentDepositsByPeriod[String(periodId)] ?? "0"),
            isNegotiable: false,
          }))
        : undefined,
  };
}

function mapClausesForUpdateInput(
  form: PropertyEditFormState,
): UpdatePropertyClausesInput {
  return {
    clauses: form.clauses.map((entry) => {
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
    }),
  };
}

async function uploadNewPropertyPhotos(
  propertyUuid: string,
  photos: PhotoEntry[],
) {
  const uploadedByIndex = new Map<number, number>();

  for (const [index, photo] of photos.entries()) {
    if (!photo.file) {
      continue;
    }

    const result = await uploadHttpAdapter.uploadPropertyPhoto({
      propertyUuid,
      file: photo.file,
      label: photo.label,
      altText: photo.altText,
      sortOrder: index,
      isCover: photo.isCover,
    });

    uploadedByIndex.set(index, result.photoId);
  }

  return uploadedByIndex;
}

function buildUpdatePhotosInput(
  photos: PhotoEntry[],
  uploadedByIndex: Map<number, number>,
): UpdatePropertyPhotosInput {
  return {
    photos: photos.flatMap((photo, index) => {
      const photoId =
        photo.kind === "existing" ? photo.photoId : uploadedByIndex.get(index);

      if (!photoId) {
        return [];
      }

      return [
        {
          photoId,
          sortOrder: index,
          isCover: photo.isCover,
          label: photo.label.trim() === "" ? undefined : photo.label.trim(),
          altText:
            photo.altText.trim() === "" ? undefined : photo.altText.trim(),
        },
      ];
    }),
  };
}

function getFirstInvalidSection(
  completion: PropertyEditCompletionState,
): PropertyEditSectionId | null {
  if (!completion.isGeneralSectionComplete) return "general";
  if (!completion.isPropertyDetailsSectionComplete) return "details";
  if (!completion.isMultimediaSectionComplete) return "multimedia";
  if (!completion.isLocationSectionComplete) return "location";
  if (!completion.isPricingSectionComplete) return "pricing";

  return null;
}

function useEditingPropertyUuid() {
  return React.useSyncExternalStore(
    () => () => undefined,
    () => readEditingPropertyUuid(),
    () => null,
  );
}

function useBootstrapQueries(propertyUuid: string | null) {
  const resolvedUuid = propertyUuid ?? "";

  const detailQuery = useProperty(resolvedUuid);
  const servicesQuery = usePropertyServices(resolvedUuid);
  const pricesQuery = usePropertyPrices(resolvedUuid);
  const clausesQuery = usePropertyClauses(resolvedUuid);
  const photosQuery = usePropertyPhotos(resolvedUuid);

  return {
    detailQuery,
    servicesQuery,
    pricesQuery,
    clausesQuery,
    photosQuery,
  };
}

function resolveBootstrapData(
  queries: ReturnType<typeof useBootstrapQueries>,
): PropertyEditBootstrapData | null {
  const { detailQuery, servicesQuery, pricesQuery, clausesQuery, photosQuery } =
    queries;

  if (
    !detailQuery.data ||
    !servicesQuery.data ||
    !pricesQuery.data ||
    !clausesQuery.data ||
    !photosQuery.data
  ) {
    return null;
  }

  return {
    detail: detailQuery.data,
    services: servicesQuery.data,
    prices: pricesQuery.data,
    clauses: clausesQuery.data.clauses,
    photos: photosQuery.data.photos,
  };
}

function PropertyEditLoadingSkeleton() {
  return (
    <div className="admin-page-view flex min-h-full flex-col bg-background text-foreground">
      <div className="grid w-full gap-8 xl:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden xl:block xl:border-r xl:border-border xl:pr-6">
          <div className="pt-(--admin-page-padding-y) space-y-4">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-7 w-44 rounded-full" />
            <div className="space-y-2 pt-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 pb-8 xl:px-4">
          <div className="sticky top-(--admin-topbar-height) z-30 bg-background">
            <header className="flex flex-col gap-4 border-b border-border bg-background pt-(--admin-page-padding-y) pb-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-8 w-64 rounded-full" />
                <Skeleton className="h-4 w-md max-w-full rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-28 rounded-2xl" />
                <Skeleton className="h-10 w-24 rounded-2xl" />
                <Skeleton className="h-10 w-28 rounded-2xl" />
                <Skeleton className="h-10 w-40 rounded-2xl" />
              </div>
            </header>
          </div>

          <div className="space-y-6 pt-6">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-56 w-full rounded-3xl" />
              <Skeleton className="h-56 w-full rounded-3xl" />
            </div>
            <Skeleton className="h-72 w-full rounded-3xl" />
          </div>
        </main>
      </div>
    </div>
  );
}

function PropertyEditHeader(props: {
  activeSection: PropertyEditSectionId;
  canGoBack: boolean;
  canGoNext: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onCancel: () => void;
  onNext: () => void;
  onSave: () => void;
  title: string;
}) {
  const { t } = usePropertiesTranslation();
  const activeNav = editNavItems.find(
    (item) => item.id === props.activeSection,
  );

  return (
    <div className="sticky top-(--admin-topbar-height) z-30 bg-background">
      <header className="flex flex-col gap-4 border-b border-border bg-background pt-(--admin-page-padding-y) pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {activeNav ? t(activeNav.labelKey) : t("edit.page.title")}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t(`create.sectionDescriptions.${props.activeSection}`)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {props.canGoBack ? (
            <Button type="button" variant="outline" onClick={props.onBack}>
              {t("create.footer.previous")}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            disabled={props.isSubmitting}
            onClick={props.onCancel}
          >
            {t("edit.footer.cancel")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={props.isSubmitting || !props.canGoNext}
            onClick={props.onNext}
          >
            {t("create.footer.next")}
          </Button>
          <Button
            disabled={props.isSubmitting}
            type="button"
            onClick={props.onSave}
          >
            {props.isSubmitting ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <HugeiconsIcon icon={SaveIcon} size={16} strokeWidth={1.8} />
            )}
            <span>
              {props.isSubmitting
                ? t("edit.footer.saving")
                : t("edit.footer.save")}
            </span>
          </Button>
        </div>
      </header>
    </div>
  );
}

function PropertyEditSidebar(props: {
  activeSection: PropertyEditSectionId;
  title: string;
  onSectionChange: (section: PropertyEditSectionId) => void;
}) {
  const { t } = usePropertiesTranslation();

  return (
    <aside
      className="hidden self-start xl:block xl:border-r xl:border-border xl:bg-background xl:pr-6"
      style={{
        position: "sticky",
        top: "var(--admin-topbar-height)",
      }}
    >
      <div className="bg-background pt-(--admin-page-padding-y)">
        <div className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          {t("edit.sidebar.eyebrow")}
        </div>
        <div className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
          {props.title || t("edit.page.title")}
        </div>

        <ul className="mt-6 flex flex-col gap-1">
          {editNavItems.map(({ id, icon, labelKey }) => {
            const isActive = id === props.activeSection;

            return (
              <li key={id}>
                <Button
                  className={cn(
                  "h-10 w-full justify-start px-3 text-sm",
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => props.onSectionChange(id)}
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
  );
}

function PropertyEditLoadedContent(props: {
  propertyUuid: string;
  initialData: PropertyEditBootstrapData;
}) {
  const { t } = usePropertiesTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] =
    React.useState<PropertyEditSectionId>("general");
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
  const [form, setForm] = React.useState<PropertyEditFormState>(() =>
    resolveInitialFormState(props.initialData),
  );
  const photosRef = React.useRef(form.photos);

  React.useEffect(() => {
    photosRef.current = form.photos;
  }, [form.photos]);

  React.useEffect(
    () => () => {
      photosRef.current.forEach((entry) => {
        if (entry.kind === "new" && entry.previewUrl) {
          URL.revokeObjectURL(entry.previewUrl);
        }
      });
    },
    [],
  );

  const modalitiesQuery = useModalities();
  const propertyTypesQuery = usePropertyTypes();

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

  const generalSectionValidation = React.useMemo(
    () => validateGeneralSection(form, t),
    [form, t],
  );
  const propertyDetailsSectionValidation = React.useMemo(
    () => validatePropertyDetailsSection(form, propertyTypeKind, t),
    [form, propertyTypeKind, t],
  );
  const locationSectionValidation = React.useMemo(
    () => validateLocationSection(form, t),
    [form, t],
  );
  const pricingSectionValidation = React.useMemo(
    () => validatePricingSection(form, pricingMode, t),
    [form, pricingMode, t],
  );

  const completion = React.useMemo<PropertyEditCompletionState>(
    () => ({
      isGeneralSectionComplete: generalSectionValidation.success,
      isPropertyDetailsSectionComplete:
        form.propertyTypeId !== null &&
        propertyDetailsSectionValidation.success,
      isMultimediaSectionComplete: form.photos.length > 0,
      isLocationSectionComplete: locationSectionValidation.success,
      isPricingSectionComplete: pricingSectionValidation.success,
      hasServicesSelection: form.serviceIds.length > 0,
      hasClausesSelection: form.clauses.length > 0,
    }),
    [
      form.clauses.length,
      form.photos.length,
      form.propertyTypeId,
      form.serviceIds.length,
      generalSectionValidation.success,
      locationSectionValidation.success,
      pricingSectionValidation.success,
      propertyDetailsSectionValidation.success,
    ],
  );

  const firstInvalidSection = React.useMemo(
    () => getFirstInvalidSection(completion),
    [completion],
  );

  const activeSectionIndex = editSectionOrder.indexOf(activeSection);
  const previousSection =
    activeSectionIndex > 0 ? editSectionOrder[activeSectionIndex - 1] : null;
  const nextSection =
    activeSectionIndex >= 0 && activeSectionIndex < editSectionOrder.length - 1
      ? editSectionOrder[activeSectionIndex + 1]
      : null;

  const patchForm = React.useCallback(
    (patch: Partial<PropertyEditFormState>) => {
      setForm((current) => ({
        ...current,
        ...patch,
      }));
    },
    [],
  );

  const getSubmitConfirmationMessage = React.useCallback(() => {
    const servicesEmpty = !completion.hasServicesSelection;
    const clausesEmpty = !completion.hasClausesSelection;

    if (servicesEmpty && clausesEmpty) {
      return t("edit.submitDialog.bodyServicesAndClausesEmpty");
    }

    if (servicesEmpty) {
      return t("edit.submitDialog.bodyServicesEmpty");
    }

    if (clausesEmpty) {
      return t("edit.submitDialog.bodyClausesEmpty");
    }

    return t("edit.submitDialog.body");
  }, [completion.hasClausesSelection, completion.hasServicesSelection, t]);

  const handleSubmit = React.useCallback(async () => {
    setIsSubmitting(true);

    try {
      await propertyPatchHttpAdapter.updateProperty(
        props.propertyUuid,
        buildUpdatePropertyInput(form, propertyTypeKind),
      );
      await propertyServicesHttpAdapter.updatePropertyServices(
        props.propertyUuid,
        {
          serviceIds: form.serviceIds,
        } satisfies UpdatePropertyServicesInput,
      );
      await propertyClausesHttpAdapter.updatePropertyClauses(
        props.propertyUuid,
        mapClausesForUpdateInput(form),
      );
      await propertyPricesHttpAdapter.updatePropertyPrices(
        props.propertyUuid,
        buildUpdatePricesInput(form, pricingMode),
      );

      const uploadedByIndex = await uploadNewPropertyPhotos(
        props.propertyUuid,
        form.photos,
      );

      await propertyPhotosHttpAdapter.updatePropertyPhotos(
        props.propertyUuid,
        buildUpdatePhotosInput(form.photos, uploadedByIndex),
      );

      await queryClient.invalidateQueries({ queryKey: ["properties"] });

      setIsSubmitConfirmDialogOpen(false);
      setSubmissionDialog({
        open: true,
        status: "success",
        message: t("edit.resultDialog.successBody"),
      });
    } catch (error) {
      setIsSubmitConfirmDialogOpen(false);
      setSubmissionDialog({
        open: true,
        status: "error",
        message: getUpdateErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, pricingMode, propertyTypeKind, props.propertyUuid, queryClient, t]);

  const handleAttemptSubmit = React.useCallback(() => {
    if (firstInvalidSection) {
      setActiveSection(firstInvalidSection);
      setSubmissionDialog({
        open: true,
        status: "error",
        message: t(`edit.validation.sectionIncomplete.${firstInvalidSection}`),
      });
      return;
    }

    setIsSubmitConfirmDialogOpen(true);
  }, [firstInvalidSection, t]);

  const activeSectionContent = React.useMemo(() => {
    switch (activeSection) {
      case "general":
        return (
          <GeneralSection
            disableImmutableFields
            form={form}
            patchForm={patchForm}
          />
        );
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
  }, [activeSection, form, patchForm, propertyTypeKind]);

  return (
    <div className="admin-page-view flex min-h-full flex-col bg-background text-foreground">
      <div className="grid w-full gap-8 xl:grid-cols-[230px_minmax(0,1fr)]">
        <PropertyEditSidebar
          activeSection={activeSection}
          title={form.title}
          onSectionChange={setActiveSection}
        />

        <main className="min-w-0 pb-8 xl:px-4">
          <PropertyEditHeader
            activeSection={activeSection}
            canGoBack={previousSection !== null}
            canGoNext={nextSection !== null}
            isSubmitting={isSubmitting}
            onBack={() => previousSection && setActiveSection(previousSection)}
            onCancel={() => setIsCancelDialogOpen(true)}
            onNext={() => nextSection && setActiveSection(nextSection)}
            onSave={handleAttemptSubmit}
            title={form.title}
          />

          <div>{activeSectionContent}</div>
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
            <AlertDialogTitle>{t("edit.cancelDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("edit.cancelDialog.body")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("edit.cancelDialog.dismiss")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearEditingPropertyUuid();
                router.push(ROUTES.admin.properties);
              }}
            >
              {t("edit.cancelDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isSubmitConfirmDialogOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setIsSubmitConfirmDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HugeiconsIcon icon={SaveIcon} size={20} strokeWidth={1.8} />
            </div>
            <AlertDialogTitle>{t("edit.submitDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {getSubmitConfirmationMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {t("edit.submitDialog.dismiss")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                if (!isSubmitting) {
                  void handleSubmit();
                }
              }}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>{t("edit.submitDialog.submitting")}</span>
                </span>
              ) : (
                t("edit.submitDialog.confirm")
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
                ? t("edit.resultDialog.successTitle")
                : t("edit.resultDialog.errorTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {submissionDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {submissionDialog.status === "success"
                ? t("edit.resultDialog.successDismiss")
                : t("edit.resultDialog.errorDismiss")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (submissionDialog.status === "success") {
                  clearEditingPropertyUuid();
                  router.push(ROUTES.admin.properties);
                }
              }}
            >
              {submissionDialog.status === "success"
                ? t("edit.resultDialog.successConfirm")
                : t("edit.resultDialog.errorConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function PropertyEditPageContent() {
  const { t } = usePropertiesTranslation();
  const router = useRouter();
  const propertyUuid = useEditingPropertyUuid();
  const queries = useBootstrapQueries(propertyUuid);

  const isBootstrapLoading =
    propertyUuid !== null &&
    (queries.detailQuery.isLoading ||
      queries.servicesQuery.isLoading ||
      queries.pricesQuery.isLoading ||
      queries.clausesQuery.isLoading ||
      queries.photosQuery.isLoading);

  const bootstrapError =
    queries.detailQuery.error ??
    queries.servicesQuery.error ??
    queries.pricesQuery.error ??
    queries.clausesQuery.error ??
    queries.photosQuery.error ??
    null;

  const bootstrapData = React.useMemo(
    () => resolveBootstrapData(queries),
    [queries],
  );

  if (propertyUuid === null) {
    return (
      <div className="admin-page-view flex min-h-full flex-col bg-background">
        <Empty className="min-h-0 flex-1 rounded-3xl border border-dashed border-border/70 bg-muted/15 p-6">
          <EmptyHeader>
            <EmptyTitle>{t("edit.states.missingSelectionTitle")}</EmptyTitle>
            <EmptyDescription>
              {t("edit.states.missingSelectionDescription")}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className=""
              onClick={() => router.push(ROUTES.admin.properties)}
            >
              {t("edit.states.backToList")}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  if (isBootstrapLoading || !bootstrapData) {
    return <PropertyEditLoadingSkeleton />;
  }

  if (bootstrapError) {
    return (
      <div className="admin-page-view flex min-h-full flex-col bg-background">
        <Empty className="min-h-0 flex-1 rounded-3xl border border-dashed border-border/70 bg-muted/15 p-6">
          <EmptyHeader>
            <EmptyMedia
              className="bg-destructive/10 text-destructive"
              variant="icon"
            >
              <HugeiconsIcon icon={Alert02Icon} size={24} strokeWidth={1.8} />
            </EmptyMedia>
            <EmptyTitle>{t("edit.states.loadErrorTitle")}</EmptyTitle>
            <EmptyDescription>
              {getUpdateErrorMessage(bootstrapError)}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className=""
              onClick={() => {
                void queries.detailQuery.refetch();
                void queries.servicesQuery.refetch();
                void queries.pricesQuery.refetch();
                void queries.clausesQuery.refetch();
                void queries.photosQuery.refetch();
              }}
            >
              {t("states.retry")}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <PropertyEditLoadedContent
      initialData={bootstrapData}
      propertyUuid={propertyUuid}
    />
  );
}
