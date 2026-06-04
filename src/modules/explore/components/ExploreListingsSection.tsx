"use client";

import { Button } from "@/components/ui/button";
import type { ExploreListing } from "@/modules/explore/data/explore-listings";
import { ExploreListingCard } from "@/modules/explore/components/ExploreListingCard";

type ExploreListingsSectionProps = {
  listings: ExploreListing[];
  onReset: () => void;
  totalCount: number;
};

export function ExploreListingsSection({
  listings,
  onReset,
  totalCount,
}: ExploreListingsSectionProps) {
  const highlightedListings = listings.slice(0, 3);
  const remainingListings = listings.slice(highlightedListings.length);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-medium text-foreground">
            Propiedades disponibles
          </h2>
          <p className="text-sm text-muted-foreground">
            Mostrando {listings.length} de {totalCount} espacios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            Publico
          </span>
          <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            Spazio Explore
          </span>
        </div>
      </header>

      {listings.length > 0 ? (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            {highlightedListings.map((listing) => (
              <div key={listing.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    Seleccion Spazio
                  </p>
                  <span className="rounded-full border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
                    Curada
                  </span>
                </div>
                <ExploreListingCard listing={listing} />
              </div>
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
            No encontramos propiedades con esos filtros.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={onReset}
          >
            Reiniciar filtros
          </Button>
        </div>
      )}
    </section>
  );
}
