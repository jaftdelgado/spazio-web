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
  imageSrc: typeof apartmentIcon;
};

export const exploreTypeMeta: Record<
  ExploreListingType,
  { imageSrc: typeof apartmentIcon; label: string }
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

export const exploreListings: ExploreListing[] = [
  {
    id: "exp-01",
    title: "Casa con jardín en Lomas",
    type: "house",
    mode: "sale",
    city: "Ciudad de Mexico",
    neighborhood: "Lomas de Chapultepec",
    price: 12800000,
    bedrooms: 4,
    bathrooms: 4,
    area: 420,
    featured: true,
    parking: true,
    petFriendly: true,
    imageSrc: houseIcon,
  },
  {
    id: "exp-02",
    title: "Departamento con terraza en Polanco",
    type: "apartment",
    mode: "rent",
    city: "Ciudad de Mexico",
    neighborhood: "Polanco",
    price: 58000,
    bedrooms: 2,
    bathrooms: 2,
    area: 132,
    featured: true,
    parking: true,
    petFriendly: false,
    imageSrc: apartmentIcon,
  },
  {
    id: "exp-03",
    title: "Local en avenida principal",
    type: "commercial",
    mode: "rent",
    city: "Guadalajara",
    neighborhood: "Providencia",
    price: 72000,
    bedrooms: null,
    bathrooms: 2,
    area: 188,
    featured: false,
    parking: true,
    petFriendly: false,
    imageSrc: commercialIcon,
  },
  {
    id: "exp-04",
    title: "Casa moderna con roof garden",
    type: "house",
    mode: "sale",
    city: "Puebla",
    neighborhood: "Lomas de Angelopolis",
    price: 4650000,
    bedrooms: 3,
    bathrooms: 3,
    area: 260,
    featured: false,
    parking: true,
    petFriendly: true,
    imageSrc: houseIcon,
  },
  {
    id: "exp-05",
    title: "Departamento compacto para inversion",
    type: "apartment",
    mode: "sale",
    city: "Merida",
    neighborhood: "Montebello",
    price: 2190000,
    bedrooms: 1,
    bathrooms: 1,
    area: 74,
    featured: true,
    parking: false,
    petFriendly: true,
    imageSrc: apartmentIcon,
  },
  {
    id: "exp-06",
    title: "Oficina flexible en zona financiera",
    type: "commercial",
    mode: "sale",
    city: "Monterrey",
    neighborhood: "San Pedro",
    price: 6900000,
    bedrooms: null,
    bathrooms: 2,
    area: 210,
    featured: false,
    parking: true,
    petFriendly: false,
    imageSrc: commercialIcon,
  },
  {
    id: "exp-07",
    title: "Casa familiar cerca del mar",
    type: "house",
    mode: "rent",
    city: "Cancun",
    neighborhood: "Puerto Cancun",
    price: 95000,
    bedrooms: 4,
    bathrooms: 4,
    area: 380,
    featured: true,
    parking: true,
    petFriendly: true,
    imageSrc: houseIcon,
  },
  {
    id: "exp-08",
    title: "Loft con vista urbana",
    type: "apartment",
    mode: "rent",
    city: "Queretaro",
    neighborhood: "Juriquilla",
    price: 32000,
    bedrooms: 1,
    bathrooms: 1,
    area: 86,
    featured: false,
    parking: true,
    petFriendly: false,
    imageSrc: apartmentIcon,
  },
];
