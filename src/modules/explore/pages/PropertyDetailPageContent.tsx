"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import {
  ArrowLeft02Icon,
  Bathtub01Icon,
  BedSingle01Icon,
  Building03Icon,
  Calendar03Icon,
  Car01Icon,
  DollarCircleIcon,
  Home01Icon,
  Location01Icon,
  RulerIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@lib/auth/useAuth";
import {
  useProperty,
  usePropertyList,
} from "@/modules/properties/application/get/hooks/useProperty";
import { usePropertyPrices } from "@/modules/properties/application/prices/hooks/usePropertyPrices";
import { usePropertyClauses } from "@/modules/properties/application/clauses/hooks/usePropertyClauses";
import { usePropertiesTranslation } from "@/modules/properties/i18n/usePropertiesTranslation";
import { PropertyLocationMap } from "@/modules/properties/components/show/components/PropertyLocationMap";
import { RentPropertyModal } from "@/modules/rentals/components/RentPropertyModal";
import { toast } from "sonner";
import { CheckoutPaymentModal } from "@/modules/payments/components/CheckoutPaymentModal";
import {
  exploreTypeMeta,
  type ExploreListingType,
} from "@/modules/explore/data/explore-listings";
import { contractsHttpAdapter } from "@/modules/contracts/infra/contracts.http-adapter";
import type { CheckoutContext } from "@/modules/payments/domain/payments.entity";

type PropertyDetailPageContentProps = {
  uuid: string;
};

type TranslationFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

function formatPrice(
  price: number,
  mode: "rent" | "sale",
  locale: string,
  perMonthLabel: string,
) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });

  return mode === "rent"
    ? `${formatter.format(price)} / ${perMonthLabel}`
    : formatter.format(price);
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value);
}

function getPropertyTypeKey(propertyTypeId?: number): ExploreListingType {
  if (propertyTypeId === 2) return "apartment";
  if (propertyTypeId === 3) return "commercial";

  return "house";
}

function getPropertyTypeLabel(propertyTypeId: number | undefined, t: TranslationFn) {
  const typeKey = getPropertyTypeKey(propertyTypeId);

  return t(`exploreDetail.propertyTypes.${typeKey}`);
}

function getModalityLabel(modalityId: number | undefined, t: TranslationFn) {
  if (modalityId === 1) return t("exploreDetail.modalities.sale");
  if (modalityId === 2) return t("exploreDetail.modalities.rent");
  if (modalityId === 3) return t("exploreDetail.modalities.mixed");

  return t("exploreDetail.modalities.available");
}

function getStatusLabel(statusId: number | undefined, t: TranslationFn) {
  if (statusId === 1) return t("exploreDetail.statuses.draft");
  if (statusId === 2) return t("exploreDetail.statuses.available");
  if (statusId === 3) return t("exploreDetail.statuses.reserved");
  if (statusId === 4) return t("exploreDetail.statuses.sold");
  if (statusId === 5) return t("exploreDetail.statuses.rented");

  return t("exploreDetail.statuses.available");
}

function getActionLabel({
  isClient,
  mode,
  t,
}: {
  isClient: boolean;
  mode: "rent" | "sale";
  t: TranslationFn;
}) {
  if (!isClient) return t("exploreDetail.actions.manageProperty");

  return mode === "rent"
    ? t("exploreDetail.actions.rent")
    : t("exploreDetail.actions.buy");
}

function getShortAddress(
  location:
    | {
        neighborhood?: string | null;
        street?: string | null;
        exteriorNumber?: string | null;
      }
    | null
    | undefined,
  t: TranslationFn,
) {
  if (!location) return t("exploreDetail.location.unavailable");

  const street = [location.street, location.exteriorNumber]
    .filter(Boolean)
    .join(" ");

  const address = [street, location.neighborhood].filter(Boolean).join(", ");

  return address || t("exploreDetail.location.unavailable");
}

function getFullAddress(
  location:
    | {
        neighborhood?: string | null;
        street?: string | null;
        exteriorNumber?: string | null;
        interiorNumber?: string | null;
        postalCode?: string | null;
      }
    | null
    | undefined,
  t: TranslationFn,
) {
  if (!location) return t("exploreDetail.location.unavailable");

  const street = [location.street, location.exteriorNumber]
    .filter(Boolean)
    .join(" ");

  const interior = location.interiorNumber
    ? `${t("exploreDetail.location.interiorPrefix")} ${location.interiorNumber}`
    : "";

  const postalCode = location.postalCode
    ? `${t("exploreDetail.location.postalPrefix")} ${location.postalCode}`
    : "";

  const address = [street, interior, location.neighborhood, postalCode]
    .filter(Boolean)
    .join(", ");

  return address || t("exploreDetail.location.unavailable");
}

function getClauseText(
  clause: {
    clauseId: number;
    booleanValue: boolean | null;
    integerValue: number | null;
    minValue: number | null;
    maxValue: number | null;
  },
  t: TranslationFn,
) {
  if (clause.booleanValue !== null) {
    return clause.booleanValue
      ? t("exploreDetail.clauses.allowed")
      : t("exploreDetail.clauses.notAllowed");
  }

  if (clause.integerValue !== null) {
    return `${clause.integerValue}`;
  }

  if (clause.minValue !== null || clause.maxValue !== null) {
    const min = clause.minValue ?? t("exploreDetail.clauses.noMin");
    const max = clause.maxValue ?? t("exploreDetail.clauses.noMax");

    return t("exploreDetail.clauses.range", {
      min,
      max,
    });
  }

  return t("exploreDetail.clauses.configured");
}

function getClauseLabel(clauseId: number, t: TranslationFn) {
  const knownLabels: Record<number, string> = {
    1: "pets",
    2: "smoking",
    3: "children",
    4: "guests",
    5: "minStay",
    6: "maxStay",
  };

  const clauseKey = knownLabels[clauseId];

  if (!clauseKey) {
    return t("exploreDetail.clauses.fallbackLabel", {
      id: clauseId,
    });
  }

  return t(`exploreDetail.clauses.labels.${clauseKey}`);
}

export function PropertyDetailPageContent({
  uuid,
}: PropertyDetailPageContentProps) {
  const { role, user } = useAuth();
  const { intlLocale, t } = usePropertiesTranslation();
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutContext, setCheckoutContext] = useState<CheckoutContext | null>(null);

  const propertyQuery = useProperty(uuid);
  const pricesQuery = usePropertyPrices(uuid);
  const clausesQuery = usePropertyClauses(uuid);

  const propertiesQuery = usePropertyList({
    page: 1,
    pageSize: 100,
    sort: "created_at",
    order: "desc",
  });

  const property = propertyQuery.data;

  const cardProperty = useMemo(
    () =>
      propertiesQuery.data?.data.find((item) => item.propertyUuid === uuid) ??
      null,
    [propertiesQuery.data, uuid],
  );

  const numericRole =
    typeof role === "number"
      ? role
      : typeof role === "string"
        ? Number(role)
        : 0;

  const isClient = numericRole === 3 || numericRole === 0;

  const rentPrice =
    pricesQuery.data?.rentPrices.find((price) => price.rentPrice > 0) ?? null;
  const availableRentPeriodIds = Array.from(
    new Set(pricesQuery.data?.rentPrices.map((price) => price.periodId) ?? []),
  );

  const salePrice = pricesQuery.data?.salePrice ?? null;

  const preferredMode: "rent" | "sale" =
    isClient && rentPrice
      ? "rent"
      : cardProperty?.price?.priceType === "rent"
        ? "rent"
        : rentPrice
          ? "rent"
          : "sale";

  const displayPrice =
    preferredMode === "rent"
      ? rentPrice?.rentPrice ?? cardProperty?.price?.amount ?? 0
      : salePrice?.salePrice ?? cardProperty?.price?.amount ?? 0;

  const typeKey = getPropertyTypeKey(property?.propertyTypeId);
  const typeLabel = getPropertyTypeLabel(property?.propertyTypeId, t);
  const modalityLabel = getModalityLabel(property?.modalityId, t);
  const publicModalityLabel =
    isClient && property?.modalityId === 3
      ? t("exploreDetail.modalities.rent")
      : modalityLabel;
  const statusLabel = getStatusLabel(property?.statusId, t);
  const fallbackImage = exploreTypeMeta[typeKey].imageSrc;
  const coverPhotoUrl = cardProperty?.coverPhotoUrl ?? null;

  const residential = property?.residential ?? null;
  const commercial = property?.commercial ?? null;
  const location = property?.location ?? null;
  const clauses = clausesQuery.data?.clauses ?? [];

  const yesText = t("exploreDetail.values.yes");
  const noText = t("exploreDetail.values.no");
  const notSpecifiedText = t("exploreDetail.values.notSpecified");

  const canShowMap =
    typeof location?.latitude === "number" &&
    typeof location?.longitude === "number";
  const canOpenRentModal =
    preferredMode === "rent" &&
    isClient &&
    user?.userUuid !== undefined &&
    availableRentPeriodIds.length > 0;

  if (propertyQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-[2rem] border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {t("exploreDetail.states.loading")}
          </p>
        </div>
      </main>
    );
  }

  if (propertyQuery.isError || !property) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Card className="rounded-[2rem] p-8 text-center">
          <p className="text-base font-semibold text-foreground">
            {t("exploreDetail.states.errorTitle")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("exploreDetail.states.errorDescription")}
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/explore">{t("exploreDetail.actions.backToExplore")}</Link>
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-5">
        <Button asChild variant="ghost" className="rounded-full px-0">
          <Link href="/explore" className="inline-flex items-center gap-2">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
            {t("exploreDetail.actions.backToExplore")}
          </Link>
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[2rem] border bg-card p-0">
            <div className="relative h-[380px] overflow-hidden bg-muted">
              {coverPhotoUrl ? (
                <Image
                  fill
                  unoptimized
                  priority
                  alt={property.title}
                  className="object-cover"
                  sizes="(min-width: 1024px) 760px, 100vw"
                  src={coverPhotoUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <Image
                    alt={typeLabel}
                    className="size-40 object-contain opacity-90"
                    src={fallbackImage}
                  />
                </div>
              )}

              <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground shadow-sm">
                  {typeLabel}
                </span>
                <span className="rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground shadow-sm">
                  {publicModalityLabel}
                </span>
                {property.isFeatured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-background px-4 py-2 text-xs font-medium text-foreground shadow-sm">
                    <HugeiconsIcon icon={StarIcon} size={14} />
                    {t("exploreDetail.badges.featured")}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                    {statusLabel}
                  </span>
                  {property.isFeatured ? (
                    <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                      {t("exploreDetail.badges.spazioSelection")}
                    </span>
                  ) : null}
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {property.title}
                </h1>

                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={17}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{getShortAddress(location, t)}</span>
                </p>
              </div>

              {property.description ? (
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                  {property.description}
                </p>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-[2rem] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                {t("exploreDetail.sections.featuresTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("exploreDetail.sections.featuresDescription")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {residential ? (
                <>
                  <FeatureCard
                    icon={BedSingle01Icon}
                    label={t("exploreDetail.features.bedrooms")}
                    value={residential.bedrooms}
                  />
                  <FeatureCard
                    icon={Bathtub01Icon}
                    label={t("exploreDetail.features.bathrooms")}
                    value={residential.bathrooms}
                  />
                  <FeatureCard
                    icon={Car01Icon}
                    label={t("exploreDetail.features.parkingSpots")}
                    value={residential.parkingSpots}
                  />
                  <FeatureCard
                    icon={RulerIcon}
                    label={t("exploreDetail.features.construction")}
                    value={`${formatNumber(residential.builtArea, intlLocale)} m2`}
                  />
                  <FeatureCard
                    icon={Building03Icon}
                    label={t("exploreDetail.features.floors")}
                    value={residential.floors}
                  />
                  <FeatureCard
                    icon={Calendar03Icon}
                    label={t("exploreDetail.features.year")}
                    value={residential.constructionYear || notSpecifiedText}
                  />
                  <FeatureCard
                    icon={Home01Icon}
                    label={t("exploreDetail.features.furnished")}
                    value={residential.isFurnished ? yesText : noText}
                  />
                </>
              ) : null}

              {commercial ? (
                <>
                  <FeatureCard
                    icon={Building03Icon}
                    label={t("exploreDetail.features.offices")}
                    value={commercial.internalOffices}
                  />
                  <FeatureCard
                    icon={RulerIcon}
                    label={t("exploreDetail.features.ceilingHeight")}
                    value={`${formatNumber(commercial.ceilingHeight, intlLocale)} m`}
                  />
                  <FeatureCard
                    icon={Home01Icon}
                    label={t("exploreDetail.features.landUse")}
                    value={commercial.landUse || notSpecifiedText}
                  />
                </>
              ) : null}

              <FeatureCard
                icon={RulerIcon}
                label={t("exploreDetail.features.lotArea")}
                value={
                  property.lotArea
                    ? `${formatNumber(property.lotArea, intlLocale)} m2`
                    : notSpecifiedText
                }
              />
            </div>
          </Card>

          <Card className="rounded-[2rem] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                {t("exploreDetail.sections.clausesTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("exploreDetail.sections.clausesDescription")}
              </p>
            </div>

            {clausesQuery.isLoading ? (
              <div className="rounded-[2rem] bg-muted/40 px-6 py-10">
                <p className="text-sm text-muted-foreground">
                  {t("exploreDetail.clauses.loading")}
                </p>
              </div>
            ) : clauses.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {clauses.map((clause) => (
                  <div
                    key={clause.clauseId}
                    className="rounded-3xl border bg-background px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground">
                      {getClauseLabel(clause.clauseId, t)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {getClauseText(clause, t)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] bg-muted/40 px-6 py-10">
                <p className="text-sm text-muted-foreground">
                  {t("exploreDetail.clauses.empty")}
                </p>
              </div>
            )}
          </Card>

          <Card className="rounded-[2rem] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                {t("exploreDetail.sections.locationTitle")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {getFullAddress(location, t)}
              </p>
            </div>

            {canShowMap ? (
              <PropertyLocationMap
                latitude={location.latitude}
                longitude={location.longitude}
              />
            ) : (
              <div className="rounded-[2rem] bg-muted/40 px-6 py-10">
                <p className="text-sm text-muted-foreground">
                  {t("exploreDetail.location.noPublicCoordinates")}
                </p>
              </div>
            )}

            {location ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoRow
                  label={t("exploreDetail.location.neighborhood")}
                  value={location.neighborhood}
                />
                <InfoRow
                  label={t("exploreDetail.location.street")}
                  value={location.street}
                />
                <InfoRow
                  label={t("exploreDetail.location.exteriorNumber")}
                  value={location.exteriorNumber}
                />
                <InfoRow
                  label={t("exploreDetail.location.postalCode")}
                  value={location.postalCode}
                />
              </div>
            ) : null}
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card className="rounded-[2rem] p-6">
            <p className="text-sm text-muted-foreground">
              {t("exploreDetail.pricing.price")}
            </p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {displayPrice > 0
                ? formatPrice(
                    displayPrice,
                    preferredMode,
                    intlLocale,
                    t("exploreDetail.pricing.perMonth"),
                  )
                : t("exploreDetail.pricing.consult")}
            </p>

            {preferredMode === "rent" && rentPrice?.deposit ? (
              <div className="mt-4 rounded-3xl bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {t("exploreDetail.pricing.deposit")}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatPrice(
                    rentPrice.deposit,
                    "sale",
                    intlLocale,
                    t("exploreDetail.pricing.perMonth"),
                  )}
                </p>
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              <SummaryRow
                label={t("exploreDetail.pricing.operation")}
                value={
                  preferredMode === "rent"
                    ? t("exploreDetail.pricing.rent")
                    : t("exploreDetail.pricing.sale")
                }
              />
              <SummaryRow label={t("exploreDetail.pricing.type")} value={typeLabel} />
              <SummaryRow
                label={t("exploreDetail.pricing.modality")}
                value={modalityLabel}
              />
              <SummaryRow
                label={t("exploreDetail.pricing.status")}
                value={statusLabel}
              />
              <SummaryRow
                label={t("exploreDetail.pricing.negotiable")}
                value={
                  preferredMode === "rent"
                    ? rentPrice?.isNegotiable
                      ? yesText
                      : noText
                    : salePrice?.isNegotiable
                      ? yesText
                      : noText
                }
              />
            </div>

            <Button
              className="mt-6 w-full rounded-full"
              disabled={preferredMode === "rent" && !canOpenRentModal}
              onClick={() => {
                if (canOpenRentModal) {
                  setIsRentModalOpen(true);
                }
              }}
            >
              {getActionLabel({
                isClient,
                mode: preferredMode,
                t,
              })}
            </Button>

            <Button variant="outline" className="mt-3 w-full rounded-full">
              {t("exploreDetail.actions.contactAgent")}
            </Button>
          </Card>

          <Card className="rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {t("exploreDetail.sections.summaryTitle")}
            </h2>

            <div className="mt-5 divide-y">
              <SummaryBlock
                icon={Building03Icon}
                label={t("exploreDetail.summary.title")}
                value={property.title}
              />
              <SummaryBlock
                icon={Home01Icon}
                label={t("exploreDetail.summary.propertyType")}
                value={typeLabel}
              />
              <SummaryBlock
                icon={DollarCircleIcon}
                label={t("exploreDetail.summary.modality")}
                value={modalityLabel}
              />
              <SummaryBlock
                icon={StarIcon}
                label={t("exploreDetail.summary.status")}
                value={statusLabel}
              />
              <SummaryBlock
                icon={RulerIcon}
                label={t("exploreDetail.summary.lotArea")}
                value={
                  property.lotArea
                    ? `${formatNumber(property.lotArea, intlLocale)} m2`
                    : notSpecifiedText
                }
              />
              {residential ? (
                <>
                  <SummaryBlock
                    icon={Home01Icon}
                    label={t("exploreDetail.features.furnished")}
                    value={residential.isFurnished ? yesText : noText}
                  />
                  <SummaryBlock
                    icon={BedSingle01Icon}
                    label={t("exploreDetail.features.bedrooms")}
                    value={residential.bedrooms}
                  />
                  <SummaryBlock
                    icon={Bathtub01Icon}
                    label={t("exploreDetail.features.bathrooms")}
                    value={residential.bathrooms}
                  />
                </>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-[2rem] p-6">
            <h3 className="text-sm font-semibold text-foreground">
              {t("exploreDetail.sections.importantTitle")}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("exploreDetail.important.description")}
            </p>
          </Card>
        </aside>
      </section>

      <RentPropertyModal
        availablePeriodIds={availableRentPeriodIds}
        clientUuid={user?.userUuid ?? null}
        isOpen={isRentModalOpen}
        propertyTitle={property.title}
        propertyUuid={property.propertyUuid}
        onOpenChange={setIsRentModalOpen}
        onSuccess={async (confirmation) => {
          setIsRentModalOpen(false);
          try {
            const contractDetail = await contractsHttpAdapter.getById(confirmation.contractUuid);
            setCheckoutContext({
              contractId: contractDetail.contractId,
              contractUuid: contractDetail.contractUuid,
              currency: contractDetail.currency,
              amount: contractDetail.agreedAmount,
              periodName: contractDetail.periodName,
            });
            setIsCheckoutOpen(true);
          } catch (err) {
            console.error("Error fetching contract detail", err);
            toast.error("La renta se confirmó, pero no se pudo abrir la pasarela de pago. Busca tu contrato en 'Mis pagos'.");
          }
        }}
      />

      <CheckoutPaymentModal
        isOpen={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        checkout={checkoutContext}
        onSuccess={() => {
          void propertyQuery.refetch();
        }}
      />
    </main>
  );
}

function FeatureCard({
  icon,
  label,
  value,
}: {
  icon: typeof BedSingle01Icon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-background p-4">
      <HugeiconsIcon icon={icon} size={18} className="text-muted-foreground" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: ReactNode }) {
  if (!value) return null;

  return (
    <div className="rounded-3xl border bg-background px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function SummaryBlock({
  icon,
  label,
  value,
}: {
  icon: typeof BedSingle01Icon;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <div className="mt-1 shrink-0">
        <HugeiconsIcon icon={icon} size={22} className="text-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
