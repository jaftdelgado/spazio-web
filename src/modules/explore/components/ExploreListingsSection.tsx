"use client";

import { Button } from "@/components/ui/button";
import { ExploreListingCard } from "@/modules/explore/components/ExploreListingCard";
import type { ExploreListing } from "@/modules/explore/data/explore-listings";

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
  const highlightedListings = listings.slice(0, 3);
  const remainingListings = listings.slice(highlightedListings.length);
  const hasActiveFilters = activeFilterCount > 0;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-medium text-foreground">
            Propiedades disponibles
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Buscando espacios disponibles..."
              : `Mostrando ${listings.length} de ${totalCount} espacios.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            Público
          </span>
          <span className="rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            Spazio Explore
          </span>
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-[2rem] border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Cargando propiedades disponibles...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-[2rem] border border-dashed bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            No pudimos cargar las propiedades.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Intenta recargar la página o revisa tu conexión.
          </p>
        </div>
      ) : listings.length > 0 ? (
        <>
          <section className="grid gap-4 lg:grid-cols-3">
            {highlightedListings.map((listing) => (
              <div key={listing.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    Selección Spazio
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
            {hasActiveFilters
              ? "No encontramos propiedades con esos filtros."
              : "No hay propiedades disponibles por ahora."}
          </p>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={onReset}
            >
              Reiniciar filtros
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}