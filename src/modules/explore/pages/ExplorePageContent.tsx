"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@lib/auth/useAuth";
import {
  useModalities,
  usePropertyTypes,
} from "@/modules/catalogs/application/hooks/useCatalogs";
import { ExploreFilterSidebar } from "@/modules/explore/components/ExploreFilterSidebar";
import { ExploreHeroSection } from "@/modules/explore/components/ExploreHeroSection";
import { ExploreListingsSection } from "@/modules/explore/components/ExploreListingsSection";
import {
  exploreTypeMeta,
  type ExploreListing,
} from "@/modules/explore/data/explore-listings";
import {
  countActiveExploreFilters,
  filterExploreListings,
  initialExploreFilters,
} from "@/modules/explore/lib/explore-filters";
import { ExploreShell } from "@/modules/explore/layouts/ExploreShell";
import { usePropertyList } from "@/modules/properties/application/get/hooks/useProperty";

function mapPropertyTypeToExploreType(propertyTypeName?: string) {
  const normalizedName = propertyTypeName?.toLowerCase() ?? "";

  if (
    normalizedName.includes("apartment") ||
    normalizedName.includes("departamento")
  ) {
    return "apartment" as const;
  }

  if (
    normalizedName.includes("commercial") ||
    normalizedName.includes("comercial") ||
    normalizedName.includes("local") ||
    normalizedName.includes("oficina")
  ) {
    return "commercial" as const;
  }

  return "house" as const;
}

function mapExploreTypesToPropertyTypeIds(
  selectedTypes: ExploreListing["type"][],
  propertyTypes?: Array<{ propertyTypeId: number; name: string }>,
) {
  if (selectedTypes.length === 0 || !propertyTypes) {
    return undefined;
  }

  const selectedTypeNames: string[] = selectedTypes.map((type) => {
    if (type === "house") return "house";
    if (type === "apartment") return "apartment";
    return "commercial";
  });

  const ids = propertyTypes
    .filter((propertyType) =>
      selectedTypeNames.includes(propertyType.name.toLowerCase()),
    )
    .map((propertyType) => propertyType.propertyTypeId);

  return ids.length > 0 ? ids : undefined;
}

function mapExploreModeToModalityId(mode: "all" | "sale" | "rent") {
  if (mode === "sale") return 1;
  if (mode === "rent") return 2;

  return undefined;
}

function isRentModality(modalityName?: string) {
  const normalizedName = modalityName?.toLowerCase() ?? "";

  return (
    normalizedName.includes("rent") ||
    normalizedName.includes("renta") ||
    normalizedName.includes("rentar")
  );
}

function isMixedModality(modalityName?: string) {
  const normalizedName = modalityName?.toLowerCase() ?? "";

  return (
    normalizedName.includes("mixed") ||
    normalizedName.includes("mixta") ||
    normalizedName.includes("mixto") ||
    normalizedName.includes("venta y renta")
  );
}

function isSaleBudget(priceCap: ExploreListing["price"] | "all" | number) {
  return priceCap === 3000000 || priceCap === 8000000;
}

export function ExplorePageContent() {
  const [filters, setFilters] = useState(initialExploreFilters);
  const [heroSearch, setHeroSearch] = useState("");

  const { isLoading, role } = useAuth();

  const numericRole =
    typeof role === "number"
      ? role
      : typeof role === "string"
        ? Number(role)
        : 0;

  const canSeeSaleOption = numericRole === 1 || numericRole === 2;

  const propertyTypesQuery = usePropertyTypes();
  useModalities();

  useEffect(() => {
    if (isLoading || canSeeSaleOption) {
      return;
    }

    const shouldCleanSaleMode = filters.mode === "sale";
    const shouldCleanSaleBudget = isSaleBudget(filters.priceCap);

    if (shouldCleanSaleMode || shouldCleanSaleBudget) {
      setFilters((current) => ({
        ...current,
        mode: current.mode === "sale" ? "all" : current.mode,
        priceCap: isSaleBudget(current.priceCap) ? "all" : current.priceCap,
      }));
    }
  }, [canSeeSaleOption, filters.mode, filters.priceCap, isLoading]);

  const propertyTypeIds = mapExploreTypesToPropertyTypeIds(
    filters.types,
    propertyTypesQuery.data,
  );

  const propertyTypeId =
    propertyTypeIds && propertyTypeIds.length === 1
      ? propertyTypeIds[0]
      : undefined;

  const modalityId = canSeeSaleOption
    ? mapExploreModeToModalityId(filters.mode)
    : undefined;

  const maxPrice =
    !canSeeSaleOption && isSaleBudget(filters.priceCap)
      ? undefined
      : filters.priceCap === "all"
        ? undefined
        : filters.priceCap;

  const propertiesQuery = usePropertyList({
    page: 1,
    pageSize: 20,
    q: filters.search.trim() || undefined,
    propertyTypeId,
    modalityId,
    maxPrice,
    isFeatured: filters.featuredOnly ? true : undefined,
    minParkingSpots: filters.parkingOnly ? 1 : undefined,
    petFriendly: filters.petFriendlyOnly ? true : undefined,
    sort: "created_at",
    order: "desc",
  });

  const backendListings = useMemo<ExploreListing[]>(
    () =>
      propertiesQuery.data?.data
        .filter((property) => {
          if (canSeeSaleOption) {
            return true;
          }

          const isRent = isRentModality(property.modality.name);
          const isMixed = isMixedModality(property.modality.name);

          if (filters.mode === "rent") {
            return isRent && !isMixed;
          }

          return isMixed;
        })
        .map((property) => {
          const type = mapPropertyTypeToExploreType(property.propertyType.name);
          const city =
            property.city ?? property.location?.cityName ?? "Sin ciudad";
          const neighborhood = property.neighborhood ?? "Sin colonia";
          const hasParking = (property.parkingSpots ?? 0) > 0;

          return {
            id: property.propertyUuid,
            title: property.title,
            type,
            mode: canSeeSaleOption
              ? property.price?.priceType === "rent"
                ? "rent"
                : "sale"
              : "rent",
            city,
            neighborhood,
            price: property.price?.amount ?? 0,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.builtArea ?? 0,
            featured: property.isFeatured,
            parking: hasParking,
            petFriendly: property.petFriendly,
            imageSrc: exploreTypeMeta[type].imageSrc,
coverPhotoUrl: property.coverPhotoUrl,
          };
        }) ?? [],
    [canSeeSaleOption, filters.mode, propertiesQuery.data],
  );

  const listings = useMemo(
    () => filterExploreListings(backendListings, filters),
    [backendListings, filters],
  );

  const activeCount = countActiveExploreFilters(filters);

  const resetFilters = () => {
    setHeroSearch("");
    setFilters(initialExploreFilters);
  };

  return (
    <ExploreShell>
      <ExploreHeroSection
        activeCount={activeCount}
        heroSearch={heroSearch}
        listingCount={listings.length}
        onHeroSearchChange={setHeroSearch}
        onSearchSubmit={() =>
          setFilters((current) => ({
            ...current,
            search: heroSearch,
          }))
        }
        totalCount={backendListings.length}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <ExploreFilterSidebar
          activeCount={activeCount}
          filters={filters}
          onChange={setFilters}
          resultCount={listings.length}
          showSaleOption={canSeeSaleOption}
        />

        <ExploreListingsSection
          activeFilterCount={activeCount}
          isError={propertiesQuery.isError}
          isLoading={propertiesQuery.isLoading}
          listings={listings}
          onReset={resetFilters}
          totalCount={backendListings.length}
        />
      </div>
    </ExploreShell>
  );
}