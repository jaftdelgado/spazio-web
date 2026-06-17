"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft01Icon,
  BathIcon,
  BedBunkIcon,
  Building03Icon,
  Calendar03Icon,
  Home04Icon,
  Location01Icon,
  MapsLocation01Icon,
  Note01Icon,
  ParkingAreaCircleIcon,
  RulerIcon,
  UserIcon,
  WarehouseIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SectionHeader } from "@/components/ui/section-header";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@lib/auth/useAuth";
import { saveEditingPropertyUuid } from "@properties/application/edit/property-edit-session";
import { getModalityLabel, getPropertyTypeLabel, getStatusLabel } from "@properties/components/listing/propertyListingLabels";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { PropertyClausesList } from "./components/PropertyClausesList";
import { PropertyLocationMap } from "./components/PropertyLocationMap";
import { PropertyOverviewFacts } from "./components/PropertyOverviewFacts";
import { PropertyPhotoCarousel } from "./components/PropertyPhotoCarousel";
import { PropertyPricingCard } from "./components/PropertyPricingCard";
import { PropertyServicesList } from "./components/PropertyServicesList";
import { PropertyShowSkeleton } from "./components/PropertyShowSkeleton";
import { PropertySummaryCard } from "./components/PropertySummaryCard";
import {
  formatPriceSummary,
  formatPropertyAddress,
  formatPropertyArea,
} from "./property-show.helpers";
import type { PropertyShowFactItem } from "./types";
import { usePropertyShowResource } from "./usePropertyShowResource";

type PropertyShowPageContentProps = {
  propertyUuid: string;
};

function buildFactItems(
  t: ReturnType<typeof usePropertiesTranslation>["t"],
  locale: string,
  detail: NonNullable<ReturnType<typeof usePropertyShowResource>["detailQuery"]["data"]>,
  orientationLabel: string | null,
): PropertyShowFactItem[] {
  const facts: PropertyShowFactItem[] = [];

  if (detail.residential) {
    facts.push(
      {
        key: "bedrooms",
        icon: BedBunkIcon,
        label: t("create.fields.bedrooms.label"),
        value: String(detail.residential.bedrooms),
      },
      {
        key: "bathrooms",
        icon: BathIcon,
        label: t("create.fields.bathrooms.label"),
        value: String(detail.residential.bathrooms),
      },
      {
        key: "beds",
        icon: Home04Icon,
        label: t("create.fields.beds.label"),
        value: String(detail.residential.beds),
      },
      {
        key: "parkingSpots",
        icon: ParkingAreaCircleIcon,
        label: t("create.fields.parkingSpots.label"),
        value: String(detail.residential.parkingSpots),
      },
      {
        key: "builtArea",
        icon: WarehouseIcon,
        label: t("create.fields.builtArea.label"),
        value: formatPropertyArea(detail.residential.builtArea, locale),
      },
      {
        key: "floors",
        icon: Building03Icon,
        label: t("create.fields.floors.label"),
        value: String(detail.residential.floors),
      },
      {
        key: "constructionYear",
        icon: Calendar03Icon,
        label: t("create.fields.constructionYear.label"),
        value: String(detail.residential.constructionYear),
      },
      {
        key: "orientation",
        icon: Location01Icon,
        label: t("create.fields.orientation.label"),
        value: orientationLabel ?? t("show.values.notAvailable"),
      },
    );
  }

  if (detail.commercial) {
    facts.push(
      {
        key: "ceilingHeight",
        icon: Building03Icon,
        label: t("create.fields.ceilingHeight.label"),
        value: detail.commercial.ceilingHeight.toString(),
      },
      {
        key: "loadingDocks",
        icon: WarehouseIcon,
        label: t("create.fields.loadingDocks.label"),
        value: detail.commercial.loadingDocks.toString(),
      },
      {
        key: "internalOffices",
        icon: Note01Icon,
        label: t("create.fields.internalOffices.label"),
        value: detail.commercial.internalOffices.toString(),
      },
    );
  }

  facts.push({
    key: "lotArea",
    icon: RulerIcon,
    label: t("create.fields.lotArea.label"),
    value: formatPropertyArea(detail.lotArea, locale),
  });

  return facts;
}

function getFriendlyPropertyErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return "No pudimos conectarnos en este momento. Revisa tu conexion e intenta nuevamente.";
  }

  return "No fue posible cargar la propiedad por ahora. Intenta de nuevo en un momento.";
}

export function PropertyShowPageContent({
  propertyUuid,
}: PropertyShowPageContentProps) {
  const router = useRouter();
  const { role } = useAuth();
  const { intlLocale, t } = usePropertiesTranslation();
  const {
    detailQuery,
    pricesQuery,
    photosQuery,
    propertyType,
    modality,
    orientation,
    photos,
    propertyServicesQuery,
    propertyClausesQuery,
    servicesCatalogQuery,
    clausesCatalogQuery,
    services,
    clauses,
    rentPeriodNamesById,
    isCoreLoading,
    error,
  } = usePropertyShowResource(propertyUuid);

  const detail = detailQuery.data;
  const prices = pricesQuery.data;

  const facts = React.useMemo(
    () =>
      detail
        ? buildFactItems(t, intlLocale, detail, orientation?.name ?? null)
        : [],
    [detail, intlLocale, orientation?.name, t],
  );

  const address = React.useMemo(
    () => formatPropertyAddress(detail?.location ?? null),
    [detail?.location],
  );

  const priceItems = React.useMemo(
    () =>
      prices
        ? formatPriceSummary(prices, intlLocale, t, rentPeriodNamesById)
        : [],
    [intlLocale, prices, rentPeriodNamesById, t],
  );

  const servicesLoading =
    propertyServicesQuery.isLoading || servicesCatalogQuery.isLoading;
  const clausesLoading =
    propertyClausesQuery.isLoading || clausesCatalogQuery.isLoading;

  if (isCoreLoading) {
    return <PropertyShowSkeleton />;
  }

  if (error || !detail || !prices) {
    return (
      <div className="admin-page-view flex min-h-full flex-col py-6">
        <Empty className="min-h-[420px] rounded-[28px] border border-dashed border-border/70 bg-muted/15">
          <EmptyHeader>
            <EmptyMedia className="bg-destructive/10 text-destructive" variant="icon">
              <HugeiconsIcon icon={Note01Icon} size={24} strokeWidth={1.8} />
            </EmptyMedia>
            <EmptyTitle>{t("show.states.loadErrorTitle")}</EmptyTitle>
            <EmptyDescription>
              {getFriendlyPropertyErrorMessage(error)}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Button
              className="rounded-2xl"
              variant="outline"
              onClick={() => router.push(ROUTES.admin.properties)}
            >
              {t("show.actions.backToList")}
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => {
                void detailQuery.refetch();
                void pricesQuery.refetch();
                void photosQuery.refetch();
                void propertyServicesQuery.refetch();
                void propertyClausesQuery.refetch();
                void servicesCatalogQuery.refetch();
                void clausesCatalogQuery.refetch();
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
    <div className="admin-page-view flex min-h-full flex-col gap-8 pb-8 text-foreground">
      <header className="space-y-5 pt-(--admin-page-padding-y)">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            className="rounded-full"
            size="sm"
            variant="outline"
            onClick={() => router.push(ROUTES.admin.properties)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
            <span>{t("show.actions.backToList")}</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border/70">
              {getPropertyTypeLabel(
                detail.propertyTypeId,
                propertyType?.name ?? "",
                t,
              )}
            </span>
            <span className="inline-flex items-center rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border/70">
              {getModalityLabel(detail.modalityId, modality?.name ?? "", t)}
            </span>
            <span className="inline-flex items-center rounded-full bg-background px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border/70">
              {getStatusLabel(detail.statusId, "", t)}
            </span>
            {role === 1 ? (
              <Button
                className="rounded-full"
                size="sm"
                onClick={() => {
                  saveEditingPropertyUuid(detail.propertyUuid);
                  router.push(ROUTES.admin.propertiesEdit);
                }}
              >
                {t("show.actions.edit")}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {detail.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {address ? (
              <span className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={MapsLocation01Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>{address}</span>
              </span>
            ) : null}
            {detail.registeredBy ? (
              <span className="flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.8} />
                <span>
                  {t("show.hero.registeredBy", {
                    user: detail.registeredBy,
                  })}
                </span>
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <PropertyPhotoCarousel
        emptyLabel={t("show.photosEmpty")}
        photos={photos}
        title={detail.title}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <PropertyOverviewFacts facts={facts} />

          <section className="space-y-4">
            <SectionHeader
              className="mb-0"
              description={t("show.sections.descriptionDescription")}
              title={t("show.sections.descriptionTitle")}
              titleClassName="text-2xl font-semibold"
            />
            <div className="rounded-[28px] bg-muted/25 px-5 py-5 text-[15px] leading-7 text-foreground">
              {detail.description.trim().length > 0 ? (
                <p className="whitespace-pre-line">{detail.description}</p>
              ) : (
                <p className="text-muted-foreground">
                  {t("show.descriptionEmpty")}
                </p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <SectionHeader
              className="mb-0"
              description={t("show.sections.servicesDescription")}
              title={t("show.sections.servicesTitle")}
              titleClassName="text-2xl font-semibold"
            />
            <PropertyServicesList isLoading={servicesLoading} services={services} />
          </section>

          <section className="space-y-4">
            <SectionHeader
              className="mb-0"
              description={t("show.sections.clausesDescription")}
              title={t("show.sections.clausesTitle")}
              titleClassName="text-2xl font-semibold"
            />
            <PropertyClausesList clauses={clauses} isLoading={clausesLoading} />
          </section>

          <section className="space-y-4">
            <SectionHeader
              className="mb-0"
              description={t("show.sections.locationDescription")}
              title={t("show.sections.locationTitle")}
              titleClassName="text-2xl font-semibold"
            />
            {detail.location ? (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                <PropertyLocationMap
                  latitude={detail.location.latitude}
                  longitude={detail.location.longitude}
                />
                <Card className="rounded-[28px] border-0 bg-muted/20 shadow-none ring-1 ring-border/60">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-base font-semibold">
                      {t("show.locationCard.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {t("show.locationCard.address")}
                      </p>
                      <p className="mt-2 leading-6 text-foreground">{address}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {t("create.fields.postalCode.label")}
                        </p>
                        <p className="mt-1 text-foreground">
                          {detail.location.postalCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {t("show.locationCard.visibility")}
                        </p>
                        <p className="mt-1 text-foreground">
                          {detail.location.isPublicAddress
                            ? t("show.locationCard.public")
                            : t("show.locationCard.private")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="rounded-[28px] border-0 bg-muted/25 shadow-none ring-0">
                <CardContent className="py-6 text-sm text-muted-foreground">
                  {t("show.locationEmpty")}
                </CardContent>
              </Card>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-[calc(var(--admin-topbar-height)+1.5rem)] lg:self-start">
          <PropertyPricingCard items={priceItems} />
          <PropertySummaryCard
            detail={detail}
            intlLocale={intlLocale}
            modalityName={modality?.name ?? ""}
            propertyTypeName={propertyType?.name ?? ""}
          />
        </aside>
      </div>
    </div>
  );
}
