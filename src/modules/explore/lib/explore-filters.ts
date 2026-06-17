import type {
  ExploreListing,
  ExploreListingMode,
  ExploreListingType,
} from "@/modules/explore/data/explore-listings";

export type ExploreFilters = {
  featuredOnly: boolean;
  mode: "all" | ExploreListingMode;
  parkingOnly: boolean;
  petFriendlyOnly: boolean;
priceCap: "all" | 10000 | 20000 | 50000 | 3000000 | 8000000;
  search: string;
  types: ExploreListingType[];
};

export const initialExploreFilters: ExploreFilters = {
  featuredOnly: false,
  mode: "all",
  parkingOnly: false,
  petFriendlyOnly: false,
  priceCap: "all",
  search: "",
  types: [],
};

export function filterExploreListings(
  listings: ExploreListing[],
  filters: ExploreFilters,
) {
  const searchValue = filters.search.trim().toLowerCase();

  return listings.filter((listing) => {
    if (filters.types.length > 0 && !filters.types.includes(listing.type)) {
      return false;
    }

    if (filters.mode !== "all" && listing.mode !== filters.mode) {
      return false;
    }

    if (filters.featuredOnly && !listing.featured) {
      return false;
    }

    if (filters.parkingOnly && !listing.parking) {
      return false;
    }

    if (filters.petFriendlyOnly && !listing.petFriendly) {
      return false;
    }

    if (filters.priceCap !== "all" && listing.price > filters.priceCap) {
      return false;
    }

    if (searchValue.length > 0) {
      const haystack =
        `${listing.title} ${listing.city} ${listing.neighborhood}`.toLowerCase();

      if (!haystack.includes(searchValue)) {
        return false;
      }
    }

    return true;
  });
}

export function countActiveExploreFilters(filters: ExploreFilters) {
  return (
    filters.types.length +
    (filters.mode !== "all" ? 1 : 0) +
    (filters.featuredOnly ? 1 : 0) +
    (filters.parkingOnly ? 1 : 0) +
    (filters.petFriendlyOnly ? 1 : 0) +
    (filters.priceCap !== "all" ? 1 : 0) +
    (filters.search.trim() ? 1 : 0)
  );
}
