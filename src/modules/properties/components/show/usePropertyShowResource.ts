"use client";

import * as React from "react";

import type { Clause } from "@clauses/domain/clause.entity";
import { useClauses } from "@clauses/application/hooks/useClauses";
import { useModalities, useOrientations, usePropertyTypes, useRentPeriods } from "@catalogs/application/hooks/useCatalogs";
import { usePropertyClauses } from "@properties/application/clauses/hooks/usePropertyClauses";
import { useProperty } from "@properties/application/get/hooks/useProperty";
import { usePropertyPhotos } from "@properties/application/photos/hooks/usePropertyPhotos";
import { usePropertyPrices } from "@properties/application/prices/hooks/usePropertyPrices";
import { usePropertyServices } from "@properties/application/services/hooks/usePropertyServices";
import type { PropertyClause, PropertyPhoto } from "@properties/domain/property.entity";
import { useServices } from "@services/application/hooks/useServices";

export function usePropertyShowResource(propertyUuid: string) {
  const detailQuery = useProperty(propertyUuid);
  const pricesQuery = usePropertyPrices(propertyUuid);
  const photosQuery = usePropertyPhotos(propertyUuid);
  const propertyServicesQuery = usePropertyServices(propertyUuid);
  const propertyClausesQuery = usePropertyClauses(propertyUuid);
  const propertyTypesQuery = usePropertyTypes();
  const modalitiesQuery = useModalities();
  const orientationsQuery = useOrientations();
  const rentPeriodsQuery = useRentPeriods(detailQuery.data?.propertyTypeId ?? 0);
  const servicesCatalogQuery = useServices({ page: 1, pageSize: 50 });
  const supportsClausesCatalog =
    detailQuery.data?.modalityId !== undefined &&
    detailQuery.data.modalityId !== 3;
  const clausesCatalogQuery = useClauses({
    modalityId: supportsClausesCatalog ? (detailQuery.data?.modalityId ?? null) : null,
    page: 1,
    pageSize: 200,
  });

  const propertyType = React.useMemo(
    () =>
      (propertyTypesQuery.data ?? []).find(
        (entry) => entry.propertyTypeId === detailQuery.data?.propertyTypeId,
      ) ?? null,
    [detailQuery.data?.propertyTypeId, propertyTypesQuery.data],
  );

  const modality = React.useMemo(
    () =>
      (modalitiesQuery.data ?? []).find(
        (entry) => entry.modalityId === detailQuery.data?.modalityId,
      ) ?? null,
    [detailQuery.data?.modalityId, modalitiesQuery.data],
  );

  const orientation = React.useMemo(
    () =>
      (orientationsQuery.data ?? []).find(
        (entry) => entry.orientationId === detailQuery.data?.residential?.orientationId,
      ) ?? null,
    [detailQuery.data?.residential?.orientationId, orientationsQuery.data],
  );

  const photos = React.useMemo<PropertyPhoto[]>(
    () =>
      [...(photosQuery.data?.photos ?? [])].sort((left, right) => {
        if (left.isCover === right.isCover) {
          if (left.sortOrder === right.sortOrder) {
            return left.photoId - right.photoId;
          }

          return left.sortOrder - right.sortOrder;
        }

        return left.isCover ? -1 : 1;
      }),
    [photosQuery.data?.photos],
  );

  const services = React.useMemo(() => {
    const selectedIds = new Set(propertyServicesQuery.data?.serviceIds ?? []);

    return (servicesCatalogQuery.data?.data ?? []).filter((service) =>
      selectedIds.has(service.serviceId),
    );
  }, [propertyServicesQuery.data?.serviceIds, servicesCatalogQuery.data?.data]);

  const clauses = React.useMemo<
    { definition: Clause | null; value: PropertyClause }[]
  >(() => {
    const definitions = new Map(
      (clausesCatalogQuery.data?.data ?? []).map((definition) => [
        definition.clauseId,
        definition,
      ]),
    );

    return (propertyClausesQuery.data?.clauses ?? []).map((clause) => ({
      definition: definitions.get(clause.clauseId) ?? null,
      value: clause,
    }));
  }, [clausesCatalogQuery.data?.data, propertyClausesQuery.data?.clauses]);

  const rentPeriodNamesById = React.useMemo(
    () =>
      new Map(
        (rentPeriodsQuery.data ?? []).map((period) => [period.periodId, period.name]),
      ),
    [rentPeriodsQuery.data],
  );

  const isCoreLoading =
    detailQuery.isLoading || pricesQuery.isLoading || photosQuery.isLoading;

  const error =
    detailQuery.error ??
    pricesQuery.error ??
    photosQuery.error ??
    propertyServicesQuery.error ??
    propertyClausesQuery.error ??
    propertyTypesQuery.error ??
    modalitiesQuery.error ??
    orientationsQuery.error ??
    servicesCatalogQuery.error ??
    rentPeriodsQuery.error ??
    null;

  return {
    detailQuery,
    pricesQuery,
    photosQuery,
    propertyServicesQuery,
    propertyClausesQuery,
    servicesCatalogQuery,
    clausesCatalogQuery,
    propertyType,
    modality,
    orientation,
    photos,
    services,
    clauses,
    rentPeriodNamesById,
    isCoreLoading,
    error,
  };
}
