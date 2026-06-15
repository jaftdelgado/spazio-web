"use client";

import * as React from "react";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { usePropertyTypes } from "@catalogs/application/hooks/useCatalogs";
import type { DataGridRowBase } from "@components/core/DataGrid";
import { usePropertyList } from "@properties/application/get/hooks/useProperty";
import { propertyGetHttpAdapter } from "@properties/infra/get/property-get.http-adapter";
import type { PropertyCard } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { PropertiesDataGrid } from "./PropertiesDataGrid";
import { PropertiesDataGridFooter } from "./PropertiesDataGridFooter";
import { PropertiesDataGridHeader } from "./PropertiesDataGridHeader";
import { PropertiesGridView } from "./PropertiesGridView";

type PropertiesViewMode = "table" | "grid";
type PropertyGridRow = DataGridRowBase & PropertyCard;

function getFriendlyPropertiesErrorMessage(error: Error | null) {
  if (error instanceof TypeError) {
    return "No pudimos conectarnos en este momento. Revisa tu conexion e intenta nuevamente.";
  }

  return "No fue posible cargar las propiedades por ahora. Intenta de nuevo en un momento.";
}

function PropertiesDataGridFooterSkeleton() {
  return (
    <div className="grid w-full grid-cols-[auto_1fr] items-center gap-4">
      <div className="flex items-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-9 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-4 w-48 justify-self-end rounded-full" />
    </div>
  );
}

function PropertiesGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-border/70 bg-card/70"
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="space-y-3 px-5 py-5">
            <Skeleton className="h-5 w-2/3 rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PropertiesPageContent() {
  const { t } = usePropertiesTranslation();
  const [searchValue, setSearchValue] = React.useState("");
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<PropertiesViewMode>("table");
  const [selectedPropertyTypeIds, setSelectedPropertyTypeIds] = React.useState<
    number[] | null
  >(null);
  const [listState, setListState] = React.useState({
    page: 1,
    query: "",
  });
  const loadMoreRef = React.useRef<HTMLDivElement>(null);
  const propertyTypesQuery = usePropertyTypes();

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setListState((current) => {
        const nextQuery = searchValue.trim();

        if (current.query === nextQuery && current.page === 1) {
          return current;
        }

        return {
          page: 1,
          query: nextQuery,
        };
      });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchValue]);

  const baseFilters = React.useMemo(
    () => ({
      pageSize: 20,
      q: listState.query || undefined,
      propertyTypeId: selectedPropertyTypeIds ?? undefined,
      sort: "created_at" as const,
      order: "desc" as const,
    }),
    [listState.query, selectedPropertyTypeIds],
  );

  const filters = React.useMemo(
    () => ({
      page: listState.page,
      ...baseFilters,
    }),
    [baseFilters, listState.page],
  );

  const propertiesQuery = usePropertyList(filters, viewMode === "table");
  const propertiesInfiniteQuery = useInfiniteQuery({
    queryKey: ["properties", "list", "infinite", baseFilters],
    queryFn: ({ pageParam }) =>
      propertyGetHttpAdapter.listProperties({
        ...baseFilters,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.currentPage + 1 : undefined,
    enabled: viewMode === "grid",
  });

  const rows = React.useMemo<PropertyGridRow[]>(
    () =>
      (viewMode === "table"
        ? (propertiesQuery.data?.data ?? [])
        : (propertiesInfiniteQuery.data?.pages.flatMap((page) => page.data) ??
          [])
      ).map((property) => ({
        id: property.propertyUuid,
        ...property,
      })),
    [propertiesInfiniteQuery.data?.pages, propertiesQuery.data?.data, viewMode],
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } =
    propertiesInfiniteQuery;
  const propertyTypeOptions = React.useMemo(
    () => propertyTypesQuery.data ?? [],
    [propertyTypesQuery.data],
  );
  const effectiveSelectedPropertyTypeIds = React.useMemo(
    () =>
      selectedPropertyTypeIds ??
      propertyTypeOptions.map((propertyType) => propertyType.propertyTypeId),
    [propertyTypeOptions, selectedPropertyTypeIds],
  );

  React.useEffect(() => {
    if (viewMode !== "grid") return;

    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: "200px 0px",
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, viewMode]);

  const propertyDetailsQueries = useQueries({
    queries:
      selectedPropertyTypeIds !== null && selectedPropertyTypeIds.length === 0
        ? []
        : rows.map((row) => ({
            queryKey: ["properties", "detail", row.propertyUuid],
            queryFn: () => propertyGetHttpAdapter.getProperty(row.propertyUuid),
            enabled: row.propertyUuid.length > 0,
            staleTime: 60_000,
          })),
  });

  const propertyAddressMap = React.useMemo(() => {
    return Object.fromEntries(
      rows.map((row, index) => {
        const detail = propertyDetailsQueries[index]?.data;
        const location = detail?.location;

        if (!location) {
          return [row.propertyUuid, null];
        }

        const addressParts = [
          location.street,
          location.exteriorNumber,
          location.interiorNumber
            ? `${t("address.interiorNumberPrefix")} ${location.interiorNumber}`
            : null,
          location.neighborhood,
        ].filter(Boolean);

        return [row.propertyUuid, addressParts.join(", ")];
      }),
    ) as Record<string, string | null>;
  }, [propertyDetailsQueries, rows, t]);

  const isTableDetailsLoading = React.useMemo(
    () =>
      viewMode === "table" &&
      rows.length > 0 &&
      propertyDetailsQueries.some(
        (query) => query.status === "pending" && query.data === undefined,
      ),
    [propertyDetailsQueries, rows.length, viewMode],
  );

  const isPropertiesLoading =
    viewMode === "table"
      ? propertiesQuery.isLoading || isTableDetailsLoading
      : propertiesInfiniteQuery.isLoading;

  const handleRetry = React.useCallback(async () => {
    setIsRetrying(true);

    try {
      if (viewMode === "table") {
        await propertiesQuery.refetch();
        return;
      }

      await propertiesInfiniteQuery.refetch();
    } finally {
      setIsRetrying(false);
    }
  }, [propertiesInfiniteQuery, propertiesQuery, viewMode]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PropertiesDataGridHeader
        onSelectedPropertyTypeIdsChange={(propertyTypeIds) => {
          setSelectedPropertyTypeIds(
            propertyTypeIds.length === propertyTypeOptions.length
              ? null
              : propertyTypeIds,
          );
          setListState((current) => ({
            ...current,
            page: 1,
          }));
        }}
        onSearchChange={setSearchValue}
        onViewModeChange={setViewMode}
        propertyTypeOptions={propertyTypeOptions}
        searchValue={searchValue}
        selectedPropertyTypeIds={effectiveSelectedPropertyTypeIds}
        viewMode={viewMode}
      />

      {selectedPropertyTypeIds !== null &&
      selectedPropertyTypeIds.length === 0 ? (
        <Empty className="min-h-60 rounded-3xl border border-dashed border-border/70 bg-muted/15 p-6">
          <EmptyHeader>
            <EmptyTitle>{t("states.emptySelectionTitle")}</EmptyTitle>
            <EmptyDescription>{t("states.emptySelectionDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        viewMode === "table"
          ? propertiesQuery.isError
          : propertiesInfiniteQuery.isError
      ) ? (
        <Empty className="min-h-0 flex-1 rounded-3xl border border-dashed border-border/70 bg-muted/15 p-6">
          <EmptyHeader>
            <EmptyMedia className="bg-destructive/10 text-destructive" variant="icon">
              <HugeiconsIcon icon={Alert02Icon} size={24} strokeWidth={1.8} />
            </EmptyMedia>
            <EmptyTitle>{t("states.loadErrorTitle")}</EmptyTitle>
            <EmptyDescription>
              {getFriendlyPropertiesErrorMessage(
                viewMode === "table"
                  ? (propertiesQuery.error ?? null)
                  : (propertiesInfiniteQuery.error ?? null),
              )}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="rounded-2xl"
              disabled={isRetrying}
              size="sm"
              onClick={() => {
                void handleRetry();
              }}
            >
              {t("states.retry")}
            </Button>
          </EmptyContent>
        </Empty>
      ) : !isPropertiesLoading && rows.length === 0 ? (
        <Empty className="min-h-60 rounded-3xl border border-dashed border-border/70 bg-muted/15 p-6">
          <EmptyHeader>
            <EmptyTitle>{t("states.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("states.emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : viewMode === "table" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="min-h-0 flex-1">
            <PropertiesDataGrid
              isLoading={isPropertiesLoading}
              propertyAddressMap={propertyAddressMap}
              rows={rows}
            />
          </div>
          <div className="shrink-0">
            {propertiesQuery.data ? (
              <PropertiesDataGridFooter
                currentPage={propertiesQuery.data.meta.currentPage}
                onPageChange={(page) =>
                  setListState((current) => ({
                    ...current,
                    page,
                  }))
                }
                totalCount={propertiesQuery.data.meta.totalCount}
                totalPages={propertiesQuery.data.meta.totalPages}
                visibleRowCount={rows.length}
              />
            ) : (
              <PropertiesDataGridFooterSkeleton />
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {isPropertiesLoading ? (
            <PropertiesGridSkeleton />
          ) : (
            <PropertiesGridView
              propertyAddressMap={propertyAddressMap}
              rows={rows}
            />
          )}
          <div ref={loadMoreRef} className="h-1 w-full" />
        </div>
      )}
    </div>
  );
}
