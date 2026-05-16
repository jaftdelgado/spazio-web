"use client";

import * as React from "react";

import { Button } from "@heroui/react";
import { useInfiniteQuery, useQueries } from "@tanstack/react-query";

import { usePropertyTypes } from "@catalogs/application/hooks/useCatalogs";
import type { DataGridRowBase } from "@components/core/DataGrid";
import { usePropertyList } from "@properties/application/get/hooks/useProperty";
import { PropertiesDataGridHeader } from "./PropertiesDataGridHeader";
import { PropertiesDataGrid } from "./PropertiesDataGrid";
import { PropertiesDataGridFooter } from "./PropertiesDataGridFooter";
import { PropertiesGridView } from "./PropertiesGridView";
import { propertyGetHttpAdapter } from "@properties/infra/get/property-get.http-adapter";
import type { PropertyCard } from "@properties/domain/property.entity";

type PropertiesViewMode = "table" | "grid";
type PropertyGridRow = DataGridRowBase & PropertyCard;

export function PropertiesPageContent() {
  const [searchValue, setSearchValue] = React.useState("");
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
      (
        viewMode === "table"
          ? propertiesQuery.data?.data ?? []
          : (propertiesInfiniteQuery.data?.pages.flatMap((page) => page.data) ?? [])
      ).map((property) => ({
        id: property.propertyUuid,
        ...property,
      })),
    [propertiesInfiniteQuery.data?.pages, propertiesQuery.data?.data, viewMode],
  );
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = propertiesInfiniteQuery;
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

        if (
          entry?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage
        ) {
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
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    viewMode,
  ]);

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
          location.interiorNumber ? `Int. ${location.interiorNumber}` : null,
          location.neighborhood,
        ].filter(Boolean);

        return [row.propertyUuid, addressParts.join(", ")];
      }),
    ) as Record<string, string | null>;
  }, [propertyDetailsQueries, rows]);

  return (
    <div className="flex flex-1 flex-col gap-4 min-h-0">
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
        propertyTypeOptions={propertyTypeOptions}
        searchValue={searchValue}
        selectedPropertyTypeIds={effectiveSelectedPropertyTypeIds}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {selectedPropertyTypeIds !== null &&
      selectedPropertyTypeIds.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          No hay propiedades para mostrar.
        </div>
      ) : (viewMode === "table"
        ? propertiesQuery.isLoading
        : propertiesInfiniteQuery.isLoading) ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          Cargando propiedades...
        </div>
      ) : (viewMode === "table"
          ? propertiesQuery.isError
          : propertiesInfiniteQuery.isError) ? (
        <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 px-4 py-5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-700">
              No se pudieron cargar las propiedades.
            </p>
            <p className="text-sm text-red-600">
              {viewMode === "table"
                ? propertiesQuery.error?.message
                : propertiesInfiniteQuery.error?.message}
            </p>
          </div>
          <Button
            onPress={() =>
              viewMode === "table"
                ? propertiesQuery.refetch()
                : propertiesInfiniteQuery.refetch()
            }
            size="sm"
          >
            Reintentar
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          No hay propiedades para mostrar.
        </div>
      ) : viewMode === "table" ? (
        <div className="flex flex-1 flex-col gap-4 min-h-0">
          <PropertiesDataGrid
            propertyAddressMap={propertyAddressMap}
            rows={rows}
          />
          <div className="mt-auto">
            <PropertiesDataGridFooter
              currentPage={propertiesQuery.data?.meta.currentPage ?? listState.page}
              onPageChange={(page) =>
                setListState((current) => ({
                  ...current,
                  page,
                }))
              }
              totalCount={propertiesQuery.data?.meta.totalCount ?? 0}
              totalPages={propertiesQuery.data?.meta.totalPages ?? 1}
              visibleRowCount={rows.length}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-4 min-h-0">
          <PropertiesGridView
            propertyAddressMap={propertyAddressMap}
            rows={rows}
          />
          <div ref={loadMoreRef} className="h-1 w-full" />
        </div>
      )}
    </div>
  );
}
