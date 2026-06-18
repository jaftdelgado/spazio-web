"use client";

import { Button } from "@/components/ui/button";
import { ExploreListingCard } from "@/modules/explore/components/ExploreListingCard";
import type { ExploreListing } from "@/modules/explore/data/explore-listings";
import { usePropertiesTranslation } from "@/modules/properties/i18n/usePropertiesTranslation";

type ExploreListingsSectionProps = {
  listings: ExploreListing[];
  onReset: () => void;
  totalCount: number;
  isLoading?: boolean;
  isError?: boolean;
  activeFilterCount?: number;
};

export function ExploreListingsSection({
  listings,
  onReset,
  totalCount,
  isLoading = false,
  isError = false,
  activeFilterCount = 0,
}: ExploreListingsSectionProps) {
  const { t } = usePropertiesTranslation();

  const highlightedListings = listings.slice(0, 3);
  const remainingListings = listings.slice(highlightedListings.length);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <section className="space-y-6">
      <header className="max-w-3xl space-y-3">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("explore.hero.title")}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {t("explore.hero.description")}
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-[2rem] border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t("explore.listings.loading")}
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-[2rem] border border-dashed bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            {t("explore.listings.errorTitle")}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("explore.listings.errorDescription")}
          </p>
        </div>
      ) : listings.length > 0 ? (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            {highlightedListings.map((listing) => (
              <ExploreListingCard key={listing.id} listing={listing} />
            ))}
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {remainingListings.map((listing) => (
              <ExploreListingCard key={listing.id} listing={listing} />
            ))}
          </section>
        </>
      ) : (
        <div className="rounded-[2rem] border border-dashed bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? t("explore.listings.emptyWithFilters")
              : t("explore.listings.emptyDefault")}
          </p>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={onReset}
            >
              {t("explore.listings.resetFilters")}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}
