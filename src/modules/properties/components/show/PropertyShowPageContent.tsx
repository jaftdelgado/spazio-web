"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@lib/auth/useAuth";
import { saveEditingPropertyUuid } from "@properties/application/edit/property-edit-session";
import { PropertyClausesList } from "./components/PropertyClausesList";
import { PropertyPhotoCarousel } from "./components/PropertyPhotoCarousel";
import { PropertyPricingCard } from "./components/PropertyPricingCard";
import { PropertyServicesList } from "./components/PropertyServicesList";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { PropertyShowSkeleton } from "./components/PropertyShowSkeleton";
import { PropertySummaryCard } from "./components/PropertySummaryCard";
import { PropertyShowHeader } from "./components/layout/PropertyShowHeader";
import { PropertyDescriptionSection } from "./components/sections/PropertyDescriptionSection";
import { PropertyFactsSection } from "./components/sections/PropertyFactsSection";
import { PropertyLocationSection } from "./components/sections/PropertyLocationSection";
import { PropertyShowSection } from "./components/common/PropertyShowSection";
import { PropertyShowErrorState } from "./components/states/PropertyShowErrorState";
import { formatPriceSummary, formatPropertyAddress } from "./property-show.helpers";
import {
  buildPropertyFactItems,
  getFriendlyPropertyErrorMessage,
} from "./property-show.factories";
import { usePropertyShowResource } from "./usePropertyShowResource";

type PropertyShowPageContentProps = {
  propertyUuid: string;
};

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
        ? buildPropertyFactItems(t, intlLocale, detail, orientation?.name ?? null)
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
      <PropertyShowErrorState
        backLabel={t("show.actions.backToList")}
        message={getFriendlyPropertyErrorMessage(error)}
        onBack={() => router.push(ROUTES.admin.properties)}
        onRetry={() => {
          void detailQuery.refetch();
          void pricesQuery.refetch();
          void photosQuery.refetch();
          void propertyServicesQuery.refetch();
          void propertyClausesQuery.refetch();
          void servicesCatalogQuery.refetch();
          void clausesCatalogQuery.refetch();
        }}
        retryLabel={t("states.retry")}
        title={t("show.states.loadErrorTitle")}
      />
    );
  }

  const locationAddressLine = [address, detail.location?.postalCode]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="admin-page-view flex min-h-full flex-col gap-8 pb-8 text-foreground">
      <PropertyShowHeader
        address={address}
        backLabel={t("show.actions.backToList")}
        canEdit={role === 1}
        editLabel={t("show.actions.edit")}
        onBack={() => router.push(ROUTES.admin.properties)}
        onEdit={() => {
          saveEditingPropertyUuid(detail.propertyUuid);
          router.push(ROUTES.admin.propertiesEdit);
        }}
        registeredBy={detail.registeredBy ?? null}
        registeredByLabel={
          detail.registeredBy
            ? t("show.hero.registeredBy", {
                user: detail.registeredBy,
              })
            : ""
        }
        title={detail.title}
      />

      <PropertyPhotoCarousel
        emptyLabel={t("show.photosEmpty")}
        photos={photos}
        title={detail.title}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <PropertyDescriptionSection
            emptyText={t("show.descriptionEmpty")}
            title={t("show.sections.descriptionTitle")}
            value={detail.description}
          />

          <PropertyFactsSection
            collapseLabel={t("show.actions.hide")}
            expandLabel={t("show.actions.show")}
            facts={facts}
            title={t("show.sections.detailsTitle")}
          />

          <PropertyShowSection title={t("show.sections.servicesTitle")}>
            <PropertyServicesList isLoading={servicesLoading} services={services} />
          </PropertyShowSection>

          <PropertyShowSection title={t("show.sections.clausesTitle")}>
            <PropertyClausesList clauses={clauses} isLoading={clausesLoading} />
          </PropertyShowSection>

          <PropertyLocationSection
            addressLine={locationAddressLine || null}
            emptyText={t("show.locationEmpty")}
            latitude={detail.location?.latitude}
            longitude={detail.location?.longitude}
            title={t("show.sections.locationTitle")}
          />
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
