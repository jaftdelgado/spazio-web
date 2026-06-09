"use client";

import { useMemo, useState } from "react";

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
export function ExplorePageContent() {
  const [filters, setFilters] = useState(initialExploreFilters);
  const [heroSearch, setHeroSearch] = useState("");

  const propertiesQuery = usePropertyList({
  page: 1,
  pageSize: 20,
  sort: "created_at",
  order: "desc",
});


  const backendListings = useMemo<ExploreListing[]>(
    () =>
     propertiesQuery.data?.data.map((property) => {
  const type = mapPropertyTypeToExploreType(property.propertyType.name);

  return {
    id: property.propertyUuid,
    title: property.title,
    type,
    mode: property.price?.priceType === "rent" ? "rent" : "sale",
    city: "Sin ciudad",
    neighborhood: "Sin colonia",
    price: property.price?.amount ?? 0,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.builtArea ?? 0,
    featured: false,
    parking: false,
    petFriendly: false,
    imageSrc: exploreTypeMeta[type].imageSrc,
  };
}) ?? [],
    [propertiesQuery.data],
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
        />

        <ExploreListingsSection
          listings={listings}
          onReset={resetFilters}
          totalCount={backendListings.length}
        />
      </div>
    </ExploreShell>
  );
}