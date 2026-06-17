"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Building03Icon,
  DollarCircleIcon,
  Location01Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@lib/auth/useAuth";
import type { ExploreListing } from "@/modules/explore/data/explore-listings";
import { exploreTypeMeta } from "@/modules/explore/data/explore-listings";
import { usePropertyPrices } from "@/modules/properties/application/prices/hooks/usePropertyPrices";
import { usePropertiesTranslation } from "@/modules/properties/i18n/usePropertiesTranslation";

function formatPrice(
  price: number,
  mode: ExploreListing["mode"],
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

export function ExploreListingCard({ listing }: { listing: ExploreListing }) {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const { intlLocale, t } = usePropertiesTranslation();

  const pricesQuery = usePropertyPrices(listing.id);

  const numericRole =
    typeof role === "number"
      ? role
      : typeof role === "string"
        ? Number(role)
        : 0;

  const isClient = numericRole === 3 || numericRole === 0;
  const typeMeta = exploreTypeMeta[listing.type];

  const rentPrice =
    pricesQuery.data?.rentPrices.find((price) => price.rentPrice > 0) ?? null;

  const displayMode: ExploreListing["mode"] =
    isClient && rentPrice ? "rent" : listing.mode;

  const displayPrice =
    displayMode === "rent"
      ? rentPrice?.rentPrice ?? listing.price
      : listing.price;

  const modeLabel =
    displayMode === "rent"
      ? t("explore.cards.modes.rent")
      : t("explore.cards.modes.sale");

  const typeLabel = t(`explore.cards.propertyTypes.${listing.type}`);
  const imageSrc = listing.coverPhotoUrl ?? listing.imageSrc;

  const actionLabel = !isAuthenticated
    ? t("explore.cards.viewMore")
    : !isClient
      ? t("explore.cards.manage")
      : displayMode === "rent"
        ? t("explore.cards.rent")
        : t("explore.cards.buy");

  const handleAction = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isClient) {
      router.push(`/explore/${listing.id}`);
      return;
    }

    router.push(`/admin/properties/${listing.id}`);
  };

  return (
    <Card className="group gap-0 overflow-hidden border-none bg-transparent p-0 shadow-none">
      <div className="relative h-52 overflow-hidden rounded-[1.35rem] bg-muted">
        {listing.coverPhotoUrl ? (
          <Image
            fill
            unoptimized
            alt={listing.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            src={imageSrc}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Image
              alt={typeLabel}
              className="size-28 object-contain opacity-90"
              src={typeMeta.imageSrc}
            />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm">
            {typeLabel}
          </span>
          <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm">
            {modeLabel}
          </span>
        </div>

        <button
          type="button"
          aria-label={t("explore.cards.viewOptions")}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-background text-lg leading-none text-foreground shadow-sm"
          onClick={handleAction}
        >
          ⋮
        </button>
      </div>

      <div className="space-y-3 px-1 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
            {listing.title}
          </h3>

          {listing.featured ? (
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
              {t("explore.cards.featured")}
            </span>
          ) : (
            <span className="shrink-0 text-xs text-muted-foreground">
              ☆ {t("explore.cards.available")}
            </span>
          )}
        </div>

        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon
            icon={Location01Icon}
            size={14}
            className="mt-0.5 shrink-0"
          />
          <span className="line-clamp-1">
            {listing.neighborhood}, {listing.city}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HugeiconsIcon icon={RulerIcon} size={14} />
              <span>{t("explore.cards.area")}</span>
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {listing.area > 0
                ? `${listing.area} m2`
                : t("explore.cards.noValue")}
            </p>
          </div>

          <div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <HugeiconsIcon icon={DollarCircleIcon} size={14} />
              <span>{t("explore.cards.price")}</span>
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {displayPrice > 0
                ? formatPrice(
                    displayPrice,
                    displayMode,
                    intlLocale,
                    t("explore.cards.perMonth"),
                  )
                : t("explore.cards.noValue")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Building03Icon} size={14} />
            <span>
              {listing.bedrooms ?? t("explore.cards.noValue")}{" "}
              {t("explore.cards.bedroomsShort")} ·{" "}
              {listing.bathrooms ?? t("explore.cards.noValue")}{" "}
              {t("explore.cards.bathroomsShort")}
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            className="h-8 rounded-full px-4 text-xs"
            onClick={handleAction}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </Card>
  );
}