"use client";

import Image from "next/image";

import {
  Building03Icon,
  MapsLocation01Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { DataGridRowBase } from "@components/core/DataGrid";
import type { PropertyCard } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertyGridRow = DataGridRowBase & PropertyCard;

type PropertiesGridViewProps = {
  rows: PropertyGridRow[];
  propertyAddressMap: Record<string, string | null>;
};

const chipClassName =
  "inline-flex rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground";

const formatCurrency = (price: PropertyCard["price"], locale: string) => {
  if (!price) return "-";

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);

  if (price.periodName) {
    return `${formattedAmount} / ${price.periodName}`;
  }

  return formattedAmount;
};

const formatArea = (value: number | null, locale: string) => {
  if (value === null) return "-";
  return `${new Intl.NumberFormat(locale).format(value)} m2`;
};

const formatAddress = (address: string | null | undefined) => {
  return address && address.trim().length > 0 ? address : "-";
};

export function PropertiesGridView({
  rows,
  propertyAddressMap,
}: PropertiesGridViewProps) {
  const { intlLocale, t } = usePropertiesTranslation();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className="overflow-hidden rounded-3xl border border-border/70 bg-card/80 transition-colors hover:border-ring/40"
        >
          {row.coverPhotoUrl ? (
            <div className="relative h-48 w-full bg-muted/30">
              <Image
                fill
                alt={row.title}
                className="object-cover"
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                src={row.coverPhotoUrl}
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center bg-muted/35 text-muted-foreground">
              <HugeiconsIcon
                icon={Building03Icon}
                size={32}
                strokeWidth={1.8}
              />
            </div>
          )}

          <div className="space-y-4 px-5 py-5">
            <div className="space-y-2">
              <h3 className="line-clamp-2 text-base font-medium text-foreground">
                {row.title}
              </h3>
              <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                <HugeiconsIcon
                  className="mt-1 shrink-0"
                  icon={MapsLocation01Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>{formatAddress(propertyAddressMap[row.propertyUuid])}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={chipClassName}>{row.propertyType.name}</span>
              <span className={chipClassName}>{row.modality.name}</span>
              <span className={chipClassName}>{row.status.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border/60 pt-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t("grid.price")}</p>
                <p className="mt-1 font-medium text-foreground">
                  {formatCurrency(row.price, intlLocale)}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-muted-foreground">
                  <HugeiconsIcon icon={RulerIcon} size={14} strokeWidth={1.8} />
                  <span>{t("grid.area")}</span>
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {formatArea(row.builtArea, intlLocale)}
                </p>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
