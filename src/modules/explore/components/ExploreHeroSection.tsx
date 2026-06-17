"use client";

import {
  Building06Icon,
  FilterHorizontalIcon,
  GridViewIcon,
  Search01Icon,
  Store04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePropertiesTranslation } from "@/modules/properties/i18n/usePropertiesTranslation";

type ExploreHeroSectionProps = {
  activeCount: number;
  heroSearch: string;
  listingCount: number;
  onHeroSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  totalCount: number;
};

export function ExploreHeroSection({
  activeCount,
  heroSearch,
  listingCount,
  onHeroSearchChange,
  onSearchSubmit,
  totalCount,
}: ExploreHeroSectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <section className="grid gap-4 rounded-[2rem] border bg-card px-5 py-6 shadow-sm md:grid-cols-[1.4fr_0.9fr] md:px-7">
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
          <HugeiconsIcon icon={Store04Icon} size={14} />
          {t("explore.hero.eyebrow")}
        </div>

        <div className="space-y-3">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("explore.hero.title")}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            {t("explore.hero.description")}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={heroSearch}
              onChange={(event) => onHeroSearchChange(event.target.value)}
              placeholder={t("explore.hero.searchPlaceholder")}
              className="h-11 pl-10"
            />
          </div>
          <Button type="button" className="h-11 px-5" onClick={onSearchSubmit}>
            {t("explore.hero.searchButton")}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1">
        <QuickStat
          icon={Building06Icon}
          label={t("explore.hero.stats.activeProperties")}
          value={String(totalCount)}
        />
        <QuickStat
          icon={GridViewIcon}
          label={t("explore.hero.stats.filteredResults")}
          value={String(listingCount)}
        />
        <QuickStat
          icon={FilterHorizontalIcon}
          label={t("explore.hero.stats.activeFilters")}
          value={String(activeCount)}
        />
      </div>
    </section>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: typeof Building06Icon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border bg-background px-4 py-4">
      <div className="mb-3 flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} size={18} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}