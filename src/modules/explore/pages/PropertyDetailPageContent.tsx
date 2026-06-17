"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

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
import { useProperty } from "@/modules/properties/application/get/hooks/useProperty";
import { usePropertyList } from "@/modules/properties/application/get/hooks/useProperty";
import { usePropertyPrices } from "@/modules/properties/application/prices/hooks/usePropertyPrices";
import { usePropertyClauses } from "@/modules/properties/application/clauses/hooks/usePropertyClauses";
import { PropertyLocationMap } from "@/modules/properties/components/show/components/PropertyLocationMap";
import {
  exploreTypeMeta,
  type ExploreListingType,
} from "@/modules/explore/data/explore-listings";

type PropertyDetailPageContentProps = {
  uuid: string;
};

function formatPrice(price: number, mode: "rent" | "sale") {
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });

  return mode === "rent"
    ? `${formatter.format(price)} / mes`
    : formatter.format(price);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(value);
}

function getPropertyTypeLabel(propertyTypeId?: number) {
  if (propertyTypeId === 2) return "Departamento";
  if (propertyTypeId === 3) return "Comercial";

  return "Casa";
}

function getPropertyTypeKey(propertyTypeId?: number): ExploreListingType {
  if (propertyTypeId === 2) return "apartment";
  if (propertyTypeId === 3) return "commercial";

  return "house";
}

function getModalityLabel(modalityId?: number) {
  if (modalityId === 1) return "Venta";
  if (modalityId === 2) return "Renta";
  if (modalityId === 3) return "Mixta";

  return "Disponible";
}

function getStatusLabel(statusId?: number) {
  if (statusId === 1) return "Borrador";
  if (statusId === 2) return "Disponible";
  if (statusId === 3) return "Reservada";
  if (statusId === 4) return "Vendida";
  if (statusId === 5) return "Rentada";

  return "Disponible";
}

function getActionLabel({
  isClient,
  mode,
}: {
  isClient: boolean;
  mode: "rent" | "sale";
}) {
  if (!isClient) return "Gestionar propiedad";

  return mode === "rent" ? "Rentar" : "Comprar";
}

function getShortAddress(location?: {
  neighborhood?: string | null;
  street?: string | null;
  exteriorNumber?: string | null;
} | null) {
  if (!location) return "Ubicación no disponible";

  const street = [location.street, location.exteriorNumber]
    .filter(Boolean)
    .join(" ");

  return [street, location.neighborhood].filter(Boolean).join(", ");
}

function getFullAddress(location?: {
  neighborhood?: string | null;
  street?: string | null;
  exteriorNumber?: string | null;
  interiorNumber?: string | null;
  postalCode?: string | null;
} | null) {
  if (!location) return "Ubicación no disponible";

  const street = [location.street, location.exteriorNumber]
    .filter(Boolean)
    .join(" ");

  const interior = location.interiorNumber
    ? `Int. ${location.interiorNumber}`
    : "";

  const postalCode = location.postalCode ? `C.P. ${location.postalCode}` : "";

  return [street, interior, location.neighborhood, postalCode]
    .filter(Boolean)
    .join(", ");
}

function getClauseText(clause: {
  clauseId: number;
  booleanValue: boolean | null;
  integerValue: number | null;
  minValue: number | null;
  maxValue: number | null;
}) {
  if (clause.booleanValue !== null) {
    return clause.booleanValue ? "Permitido" : "No permitido";
  }

  if (clause.integerValue !== null) {
    return `${clause.integerValue}`;
  }

  if (clause.minValue !== null || clause.maxValue !== null) {
    const min = clause.minValue ?? "Sin mínimo";
    const max = clause.maxValue ?? "Sin máximo";

    return `De ${min} a ${max}`;
  }

  return "Configurada";
}

function getClauseLabel(clauseId: number) {
  const knownLabels: Record<number, string> = {
    1: "Mascotas",
    2: "Fumar",
    3: "Niños",
    4: "Huéspedes",
    5: "Estancia mínima",
    6: "Estancia máxima",
  };

  return knownLabels[clauseId] ?? `Cláusula ${clauseId}`;
}

export function PropertyDetailPageContent({
  uuid,
}: PropertyDetailPageContentProps) {
  const { role } = useAuth();

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
  const typeLabel = getPropertyTypeLabel(property?.propertyTypeId);
  const modalityLabel = getModalityLabel(property?.modalityId);
  const publicModalityLabel =
    isClient && property?.modalityId === 3 ? "Renta" : modalityLabel;
  const statusLabel = getStatusLabel(property?.statusId);
  const fallbackImage = exploreTypeMeta[typeKey].imageSrc;
  const coverPhotoUrl = cardProperty?.coverPhotoUrl ?? null;

  const residential = property?.residential ?? null;
  const commercial = property?.commercial ?? null;
  const location = property?.location ?? null;
  const clauses = clausesQuery.data?.clauses ?? [];

  const canShowMap =
    typeof location?.latitude === "number" &&
    typeof location?.longitude === "number";

  if (propertyQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="rounded-[2rem] border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Cargando detalle de la propiedad...
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
            No pudimos cargar esta propiedad.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Puede que ya no esté disponible o que no tengas permiso para verla.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/explore">Volver a explorar</Link>
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
            Volver a explorar
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
                    Destacada
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
                      Selección Spazio
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
                  <span>{getShortAddress(location)}</span>
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
                Características principales
              </h2>
              <p className="text-sm text-muted-foreground">
                Información general del inmueble.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {residential ? (
                <>
                  <FeatureCard
                    icon={BedSingle01Icon}
                    label="Recámaras"
                    value={residential.bedrooms}
                  />
                  <FeatureCard
                    icon={Bathtub01Icon}
                    label="Baños"
                    value={residential.bathrooms}
                  />
                  <FeatureCard
                    icon={Car01Icon}
                    label="Estacionamientos"
                    value={residential.parkingSpots}
                  />
                  <FeatureCard
                    icon={RulerIcon}
                    label="Construcción"
                    value={`${formatNumber(residential.builtArea)} m2`}
                  />
                  <FeatureCard
                    icon={Building03Icon}
                    label="Pisos"
                    value={residential.floors}
                  />
                  <FeatureCard
                    icon={Calendar03Icon}
                    label="Año"
                    value={residential.constructionYear || "No indicado"}
                  />
                  <FeatureCard
                    icon={Home01Icon}
                    label="Amueblada"
                    value={residential.isFurnished ? "Sí" : "No"}
                  />
                </>
              ) : null}

              {commercial ? (
                <>
                  <FeatureCard
                    icon={Building03Icon}
                    label="Oficinas"
                    value={commercial.internalOffices}
                  />
                  <FeatureCard
                    icon={RulerIcon}
                    label="Altura"
                    value={`${formatNumber(commercial.ceilingHeight)} m`}
                  />
                  <FeatureCard
                    icon={Home01Icon}
                    label="Uso de suelo"
                    value={commercial.landUse || "No indicado"}
                  />
                </>
              ) : null}

              <FeatureCard
                icon={RulerIcon}
                label="Terreno"
                value={
                  property.lotArea
                    ? `${formatNumber(property.lotArea)} m2`
                    : "No indicado"
                }
              />
            </div>
          </Card>

          <Card className="rounded-[2rem] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Cláusulas y restricciones
              </h2>
              <p className="text-sm text-muted-foreground">
                Condiciones configuradas para esta propiedad.
              </p>
            </div>

            {clausesQuery.isLoading ? (
              <div className="rounded-[2rem] bg-muted/40 px-6 py-10">
                <p className="text-sm text-muted-foreground">
                  Cargando cláusulas...
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
                      {getClauseLabel(clause.clauseId)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {getClauseText(clause)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] bg-muted/40 px-6 py-10">
                <p className="text-sm text-muted-foreground">
                  Esta propiedad no tiene cláusulas configuradas.
                </p>
              </div>
            )}
          </Card>

          <Card className="rounded-[2rem] p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Ubicación
              </h2>
              <p className="text-sm text-muted-foreground">
                {getFullAddress(location)}
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
                  No hay coordenadas públicas disponibles para mostrar el mapa.
                </p>
              </div>
            )}

            {location ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InfoRow label="Colonia" value={location.neighborhood} />
                <InfoRow label="Calle" value={location.street} />
                <InfoRow
                  label="Número exterior"
                  value={location.exteriorNumber}
                />
                <InfoRow label="Código postal" value={location.postalCode} />
              </div>
            ) : null}
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card className="rounded-[2rem] p-6">
            <p className="text-sm text-muted-foreground">Precio</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">
              {displayPrice > 0
                ? formatPrice(displayPrice, preferredMode)
                : "Consultar"}
            </p>

            {preferredMode === "rent" && rentPrice?.deposit ? (
              <div className="mt-4 rounded-3xl bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Depósito</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {formatPrice(rentPrice.deposit, "sale")}
                </p>
              </div>
            ) : null}

            <div className="mt-5 space-y-3">
              <SummaryRow
                label="Operación"
                value={preferredMode === "rent" ? "Renta" : "Venta"}
              />
              <SummaryRow label="Tipo" value={typeLabel} />
              <SummaryRow label="Modalidad" value={modalityLabel} />
              <SummaryRow label="Estado" value={statusLabel} />
              <SummaryRow
                label="Negociable"
                value={
                  preferredMode === "rent"
                    ? rentPrice?.isNegotiable
                      ? "Sí"
                      : "No"
                    : salePrice?.isNegotiable
                      ? "Sí"
                      : "No"
                }
              />
            </div>

            <Button className="mt-6 w-full rounded-full">
              {getActionLabel({
                isClient,
                mode: preferredMode,
              })}
            </Button>

            <Button variant="outline" className="mt-3 w-full rounded-full">
              Contactar agente
            </Button>
          </Card>

          <Card className="rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold text-foreground">
              Resumen de la propiedad
            </h2>

            <div className="mt-5 divide-y">
              <SummaryBlock
                icon={Building03Icon}
                label="Título"
                value={property.title}
              />
              <SummaryBlock
                icon={Home01Icon}
                label="Tipo de propiedad"
                value={typeLabel}
              />
              <SummaryBlock
                icon={DollarCircleIcon}
                label="Modalidad"
                value={modalityLabel}
              />
              <SummaryBlock
                icon={StarIcon}
                label="Estado"
                value={statusLabel}
              />
              <SummaryBlock
                icon={RulerIcon}
                label="Superficie de terreno"
                value={
                  property.lotArea
                    ? `${formatNumber(property.lotArea)} m2`
                    : "No indicado"
                }
              />
              {residential ? (
                <>
                  <SummaryBlock
                    icon={Home01Icon}
                    label="Amueblada"
                    value={residential.isFurnished ? "Sí" : "No"}
                  />
                  <SummaryBlock
                    icon={BedSingle01Icon}
                    label="Recámaras"
                    value={residential.bedrooms}
                  />
                  <SummaryBlock
                    icon={Bathtub01Icon}
                    label="Baños"
                    value={residential.bathrooms}
                  />
                </>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-[2rem] p-6">
            <h3 className="text-sm font-semibold text-foreground">
              Información importante
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              La información de la propiedad puede cambiar. Confirma precio,
              disponibilidad y condiciones antes de iniciar el proceso.
            </p>
          </Card>
        </aside>
      </section>
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
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-background p-4">
      <HugeiconsIcon icon={icon} size={18} className="text-muted-foreground" />
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
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
  value: React.ReactNode;
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
  value: React.ReactNode;
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