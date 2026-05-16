"use client";

import * as React from "react";

import { Button } from "@heroui/react";
import { useQueries } from "@tanstack/react-query";

import type { DataGridRowBase } from "@components/core/DataGrid";
import { usePropertyList } from "@properties/application/get/hooks/useProperty";
import { PropertiesDataGridHeader } from "./PropertiesDataGridHeader";
import { PropertiesDataGrid } from "./PropertiesDataGrid";
import { PropertiesGridView } from "./PropertiesGridView";
import { propertyGetHttpAdapter } from "@properties/infra/get/property-get.http-adapter";
import type { PropertyCard } from "@properties/domain/property.entity";

type PropertiesViewMode = "table" | "grid";
type PropertyGridRow = DataGridRowBase & PropertyCard;

export function PropertiesPageContent() {
  const [searchValue, setSearchValue] = React.useState("");
  const [viewMode, setViewMode] = React.useState<PropertiesViewMode>("table");
  const [debouncedSearchValue, setDebouncedSearchValue] = React.useState("");

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchValue]);

  const filters = React.useMemo(
    () => ({
      page: 1,
      pageSize: 20,
      q: debouncedSearchValue || undefined,
      sort: "created_at" as const,
      order: "desc" as const,
    }),
    [debouncedSearchValue],
  );

  const propertiesQuery = usePropertyList(filters);

  const rows = React.useMemo<PropertyGridRow[]>(
    () =>
      (propertiesQuery.data?.data ?? []).map((property) => ({
        id: property.propertyUuid,
        ...property,
      })),
    [propertiesQuery.data?.data],
  );

  const propertyDetailsQueries = useQueries({
    queries: rows.map((row) => ({
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
    <div className="space-y-4">
      <PropertiesDataGridHeader
        onSearchChange={setSearchValue}
        searchValue={searchValue}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      {propertiesQuery.isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          Cargando propiedades...
        </div>
      ) : propertiesQuery.isError ? (
        <div className="space-y-4 rounded-xl border border-red-200 bg-red-50 px-4 py-5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-700">
              No se pudieron cargar las propiedades.
            </p>
            <p className="text-sm text-red-600">{propertiesQuery.error.message}</p>
          </div>
          <Button onPress={() => propertiesQuery.refetch()} size="sm">
            Reintentar
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
          No hay propiedades para mostrar.
        </div>
      ) : viewMode === "table" ? (
        <PropertiesDataGrid
          propertyAddressMap={propertyAddressMap}
          rows={rows}
          totalCount={propertiesQuery.data?.meta.totalCount ?? 0}
        />
      ) : (
        <PropertiesGridView
          propertyAddressMap={propertyAddressMap}
          rows={rows}
          totalCount={propertiesQuery.data?.meta.totalCount ?? 0}
        />
      )}
    </div>
  );
}
