import type { StaticImageData } from "next/image";

import apartmentIcon from "@/modules/catalogs/assets/webp/apartment_icon.webp";
import commercialIcon from "@/modules/catalogs/assets/webp/commercial_icon.webp";
import houseIcon from "@/modules/catalogs/assets/webp/house_icon.webp";

export type ExploreListingType = "house" | "apartment" | "commercial";
export type ExploreListingMode = "sale" | "rent";

export type ExploreListing = {
  id: string;
  title: string;
  type: ExploreListingType;
  mode: ExploreListingMode;
  city: string;
  neighborhood: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  featured: boolean;
  parking: boolean;
  petFriendly: boolean;
  imageSrc: StaticImageData;
  coverPhotoUrl?: string | null;
};

export const exploreTypeMeta: Record<
  ExploreListingType,
  { imageSrc: StaticImageData; label: string }
> = {
  house: {
    imageSrc: houseIcon,
    label: "Casa",
  },
  apartment: {
    imageSrc: apartmentIcon,
    label: "Departamento",
  },
  commercial: {
    imageSrc: commercialIcon,
    label: "Comercial",
  },
};

export const exploreListings: ExploreListing[] = [];