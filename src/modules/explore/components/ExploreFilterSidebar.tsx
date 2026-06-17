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
import { usePropertiesTranslation } from "@/modules/properties/i18n/usePropertiesTranslation";

type ExploreFilterSidebarProps = {
  activeCount: number;
  filters: ExploreFilters;
  onChange: (filters: ExploreFilters) => void;
  resultCount: number;
  showSaleOption?: boolean;
};

export function ExploreFilterSidebar({
  activeCount,
  filters,
  onChange,
  resultCount,
  showSaleOption = false,
}: ExploreFilterSidebarProps) {
  const { t } = usePropertiesTranslation();

  const reset = () => onChange(initialExploreFilters);

  const priceOptions: Array<{
    label: string;
    value: ExploreFilters["priceCap"];
  }> = [
    { label: t("explore.filters.budgets.any"), value: "all" },
    { label: t("explore.filters.budgets.rent50k"), value: 50000 },
    { label: t("explore.filters.budgets.sale3m"), value: 3000000 },
    { label: t("explore.filters.budgets.premium8m"), value: 8000000 },
  ];

  const clientPriceOptions: Array<{
    label: string;
    value: ExploreFilters["priceCap"];
  }> = [
    { label: t("explore.filters.budgets.any"), value: "all" },
    { label: t("explore.filters.budgets.rent10k"), value: 10000 },
    { label: t("explore.filters.budgets.rent20k"), value: 20000 },
    { label: t("explore.filters.budgets.rent50k"), value: 50000 },
  ];

  const modeOptions: Array<{
    label: string;
    value: ExploreFilters["mode"];
  }> = [
    { label: t("explore.filters.modes.all"), value: "all" },
    { label: t("explore.filters.modes.sale"), value: "sale" },
    { label: t("explore.filters.modes.rent"), value: "rent" },
  ];

  const visibleModeOptions = showSaleOption
    ? modeOptions
    : [
        { label: t("explore.filters.modes.mixed"), value: "all" as const },
        { label: t("explore.filters.modes.rent"), value: "rent" as const },
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
            <h2 className="text-sm font-medium text-foreground">
              {t("explore.filters.title")}
            </h2>
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
            {t("explore.filters.clear")}
          </Button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("explore.filters.searchLabel")}
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
                placeholder={t("explore.filters.searchPlaceholder")}
                className="pl-9"
              />
            </div>
          </div>

          <FilterSection title={t("explore.filters.propertyTypeTitle")}>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(exploreTypeMeta).map(([value]) => {
                const type = value as ExploreListingType;
                const isActive = filters.types.includes(type);

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      const nextTypes = isActive
                        ? filters.types.filter((item) => item !== value)
                        : [...filters.types, type];

                      onChange({ ...filters, types: nextTypes });
                    }}
                    className={cn(
                      "flex items-center justify-between rounded-3xl border px-3 py-2 text-left text-sm transition-colors",
                      isActive
                        ? "border-foreground bg-foreground/5 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <span>{t(`explore.cards.propertyTypes.${type}`)}</span>
                    <span className="text-xs">
                      {isActive
                        ? t("explore.filters.active")
                        : t("explore.filters.add")}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title={t("explore.filters.operationTitle")}>
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

          <FilterSection title={t("explore.filters.budgetTitle")}>
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
                    {filters.priceCap === option.value
                      ? t("explore.filters.selected")
                      : ""}
                  </span>
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title={t("explore.filters.preferencesTitle")}>
            <div className="space-y-2">
              <ToggleRow
                checked={filters.featuredOnly}
                label={t("explore.filters.preferences.featuredOnly")}
                onToggle={() =>
                  onChange({
                    ...filters,
                    featuredOnly: !filters.featuredOnly,
                  })
                }
              />
              <ToggleRow
                checked={filters.parkingOnly}
                label={t("explore.filters.preferences.parkingOnly")}
                onToggle={() =>
                  onChange({
                    ...filters,
                    parkingOnly: !filters.parkingOnly,
                  })
                }
              />
              <ToggleRow
                checked={filters.petFriendlyOnly}
                label={t("explore.filters.preferences.petFriendlyOnly")}
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
            {t("explore.filters.cancel")}
          </Button>
          <Button type="button" className="flex-1">
            {t("explore.filters.seeResults", {
              count: String(resultCount),
            })}
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