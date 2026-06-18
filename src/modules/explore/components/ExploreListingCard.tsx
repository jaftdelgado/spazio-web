"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  DollarCircleIcon,
  Location01Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
  const { role } = useAuth();
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

  const displayMode: ExploreListing["mode"] = listing.mode;

  const displayPrice =
    displayMode === "rent"
      ? (rentPrice?.rentPrice ?? listing.price)
      : listing.price;

  const modeLabel =
    displayMode === "rent"
      ? t("explore.cards.modes.rent")
      : t("explore.cards.modes.sale");

  const typeLabel = t(`explore.cards.propertyTypes.${listing.type}`);
  const imageSrc = listing.coverPhotoUrl ?? listing.imageSrc;

  const handleAction = () => {
    if (isClient) {
      router.push(`/explore/${listing.id}`);
      return;
    }

    router.push(`/admin/properties/${listing.id}`);
  };

  return (
    <Card
      className="group gap-0 overflow-hidden bg-transparent py-0 shadow-none ring-0 transition-colors duration-200 hover:cursor-pointer hover:bg-accent/60"
      role="link"
      tabIndex={0}
      onClick={handleAction}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleAction();
        }
      }}
    >
      <div className="relative h-52 overflow-hidden rounded-2xl bg-muted">
        {listing.coverPhotoUrl ? (
          <Image
            fill
            unoptimized
            alt={listing.title}
            className="object-cover"
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
      </div>

      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex h-auto flex-col gap-2.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-sm font-medium text-foreground">
              {listing.title}
            </h3>

            {listing.featured ? (
              <span className="shrink-0 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                {t("explore.cards.featured")}
              </span>
            ) : null}
          </div>

          <p className="flex items-start gap-1.5 pr-2 text-xs leading-5 text-muted-foreground">
            <HugeiconsIcon
              icon={Location01Icon}
              size={14}
              className="mt-0.5 shrink-0"
            />
            <span className="line-clamp-2 overflow-hidden text-ellipsis">
              {listing.address}
            </span>
          </p>

          <div className="grid grid-cols-2 gap-5 text-sm">
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
        </div>
      </div>
    </Card>
  );
}
