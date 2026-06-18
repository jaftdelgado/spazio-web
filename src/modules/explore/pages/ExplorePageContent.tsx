"use client";

import { useMemo, useState } from "react";

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
import { usePropertiesTranslation } from "@/modules/properties/i18n/usePropertiesTranslation";

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

export function ExplorePageContent() {
  const [filters, setFilters] = useState(initialExploreFilters);
  const [heroSearch, setHeroSearch] = useState("");

  const { t } = usePropertiesTranslation();

  const propertyTypesQuery = usePropertyTypes();
  useModalities();

  const propertyTypeIds = mapExploreTypesToPropertyTypeIds(
    filters.types,
    propertyTypesQuery.data,
  );

  const propertyTypeId =
    propertyTypeIds && propertyTypeIds.length === 1
      ? propertyTypeIds[0]
      : undefined;

  const modalityId = mapExploreModeToModalityId(filters.mode);

  const maxPrice =
    filters.priceCap === "all" ? undefined : filters.priceCap;

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
      propertiesQuery.data?.data.map((property) => {
        const type = mapPropertyTypeToExploreType(property.propertyType.name);

        const city =
          property.city ??
          property.location?.cityName ??
          t("explore.values.noCity");

        const neighborhood =
          property.neighborhood ?? t("explore.values.noNeighborhood");

        const hasParking = (property.parkingSpots ?? 0) > 0;

        return {
          id: property.propertyUuid,
          title: property.title,
          type,
          mode: property.price?.priceType === "rent" ? "rent" : "sale",
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
    [propertiesQuery.data, t],
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
          showSaleOption
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