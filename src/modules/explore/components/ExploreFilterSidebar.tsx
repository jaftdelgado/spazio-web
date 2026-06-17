"use client";

import { Search01Icon, SlidersHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ExploreListingType } from "@/modules/explore/data/explore-listings";
import { exploreTypeMeta } from "@/modules/explore/data/explore-listings";
import {
  initialExploreFilters,
  type ExploreFilters,
} from "@/modules/explore/lib/explore-filters";

type ExploreFilterSidebarProps = {
  activeCount: number;
  filters: ExploreFilters;
  onChange: (filters: ExploreFilters) => void;
  resultCount: number;
  showSaleOption?: boolean;
};

const priceOptions: Array<{
  label: string;
  value: ExploreFilters["priceCap"];
}> = [
  { label: "Cualquier precio", value: "all" },
  { label: "Hasta $50k renta", value: 50000 },
  { label: "Hasta $3M venta", value: 3000000 },
  { label: "Hasta $8M premium", value: 8000000 },
];

const clientPriceOptions: Array<{
  label: string;
  value: ExploreFilters["priceCap"];
}> = [
  { label: "Cualquier precio", value: "all" },
  { label: "Hasta $10k renta", value: 10000 },
  { label: "Hasta $20k renta", value: 20000 },
  { label: "Hasta $50k renta", value: 50000 },
];

const modeOptions: Array<{
  label: string;
  value: ExploreFilters["mode"];
}> = [
  { label: "Todo", value: "all" },
  { label: "Venta", value: "sale" },
  { label: "Renta", value: "rent" },
];

export function ExploreFilterSidebar({
  activeCount,
  filters,
  onChange,
  resultCount,
  showSaleOption = false,
}: ExploreFilterSidebarProps) {
  const reset = () => onChange(initialExploreFilters);

  const visibleModeOptions = showSaleOption
    ? modeOptions
    : [
        { label: "Mixta", value: "all" as const },
        { label: "Renta", value: "rent" as const },
      ];

  const visiblePriceOptions = showSaleOption ? priceOptions : clientPriceOptions;

  return (
    <aside className="lg:sticky lg:top-24 lg:h-[calc(100svh-7rem)]">
      <div className="flex h-full flex-col overflow-hidden rounded-4xl border bg-card">
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={SlidersHorizontalIcon}
              size={16}
              className="text-muted-foreground"
            />
            <h2 className="text-sm font-medium text-foreground">Filtros</h2>
            {activeCount > 0 ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {activeCount}
              </span>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={activeCount === 0}
            onClick={reset}
          >
            Limpiar
          </Button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Buscar
            </label>
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={filters.search}
                onChange={(event) =>
                  onChange({ ...filters, search: event.target.value })
                }
                placeholder="Ubicación o título"
                className="pl-9"
              />
            </div>
          </div>

          <FilterSection title="Tipo de propiedad">
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(exploreTypeMeta).map(([value, meta]) => {
                const isActive = filters.types.includes(
                  value as ExploreListingType,
                );

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      const nextTypes = isActive
                        ? filters.types.filter((item) => item !== value)
                        : [...filters.types, value as ExploreListingType];

                      onChange({ ...filters, types: nextTypes });
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-3xl border px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "border-foreground bg-foreground/5 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span>{meta.label}</span>
                    <span className="text-xs">
                      {isActive ? "Activo" : "Agregar"}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Operación">
            <div
              className={cn(
                "grid gap-2",
                showSaleOption ? "grid-cols-3" : "grid-cols-2",
              )}
            >
              {visibleModeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange({ ...filters, mode: option.value })}
                  className={cn(
                    "rounded-3xl border px-3 py-2 text-sm transition-colors",
                    filters.mode === option.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Presupuesto">
            <div className="space-y-2">
              {visiblePriceOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() =>
                    onChange({ ...filters, priceCap: option.value })
                  }
                  className={cn(
                    "flex w-full items-center justify-between rounded-3xl border px-3 py-2 text-sm transition-colors",
                    filters.priceCap === option.value
                      ? "border-foreground bg-foreground/5 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="text-xs">
                    {filters.priceCap === option.value ? "Seleccionado" : ""}
                  </span>
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Preferencias">
            <div className="space-y-2">
              <ToggleRow
                checked={filters.featuredOnly}
                label="Solo destacadas"
                onToggle={() =>
                  onChange({
                    ...filters,
                    featuredOnly: !filters.featuredOnly,
                  })
                }
              />
              <ToggleRow
                checked={filters.parkingOnly}
                label="Con estacionamiento"
                onToggle={() =>
                  onChange({
                    ...filters,
                    parkingOnly: !filters.parkingOnly,
                  })
                }
              />
              <ToggleRow
                checked={filters.petFriendlyOnly}
                label="Pet friendly"
                onToggle={() =>
                  onChange({
                    ...filters,
                    petFriendlyOnly: !filters.petFriendlyOnly,
                  })
                }
              />
            </div>
          </FilterSection>
        </div>

        <footer className="flex items-center gap-2 border-t bg-background p-3">
          <Button type="button" variant="ghost" className="flex-1" onClick={reset}>
            Cancelar
          </Button>
          <Button type="button" className="flex-1">
            Ver {resultCount} resultados
          </Button>
        </footer>
      </div>
    </aside>
  );
}

function FilterSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-3 border-b pb-5 last:border-b-0 last:pb-0">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function ToggleRow({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-3xl border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
    >
      <span className="text-foreground">{label}</span>
      <span
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full border transition-colors",
          checked ? "bg-foreground border-foreground" : "bg-muted border-border",
        )}
      >
        <span
          className={cn(
            "mx-0.5 size-4 rounded-full bg-background transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}