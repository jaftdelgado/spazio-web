"use client";

import {
  ArrowDown01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type ServicesSearchToolbarProps = {
  isFetchingNextPage: boolean;
  searchValue: string;
  shouldShowLoadMore: boolean;
  onFetchNextPage: () => void;
  onSearchChange: (value: string) => void;
};

export function ServicesSearchToolbar({
  isFetchingNextPage,
  searchValue,
  shouldShowLoadMore,
  onFetchNextPage,
  onSearchChange,
}: ServicesSearchToolbarProps) {
  const { t } = usePropertiesTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <HugeiconsIcon
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          icon={Search01Icon}
          size={16}
          strokeWidth={1.8}
        />
        <Input
          aria-label={t("create.services.searchPlaceholder")}
          className="h-10 rounded-2xl border-input bg-background px-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          name="property-services-search"
          placeholder={t("create.services.searchPlaceholder")}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {searchValue ? (
          <Button
            aria-label={t("create.services.clearSearch")}
            className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-2xl"
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={() => onSearchChange("")}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
          </Button>
        ) : null}
      </div>

      <div className="sm:w-35 sm:shrink-0">
        <Button
          className="h-10 w-full rounded-2xl sm:self-auto"
          disabled={!shouldShowLoadMore || isFetchingNextPage}
          type="button"
          variant="outline"
          onClick={onFetchNextPage}
        >
          {isFetchingNextPage ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              strokeWidth={1.8}
            />
          )}
          <span>
            {isFetchingNextPage
              ? t("create.services.loadingMore")
              : t("create.services.loadMore")}
          </span>
        </Button>
      </div>
    </div>
  );
}
