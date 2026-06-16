import type { ClauseEntry } from "@clauses/domain/clause.entity";

export type PhotoEntry = {
  kind: "existing" | "new";
  file?: File;
  photoId?: number;
  storageKey?: string;
  previewUrl: string | null;
  label: string;
  altText: string;
  isCover: boolean;
};

export type PropertyEditSectionId =
  | "general"
  | "details"
  | "location"
  | "pricing"
  | "services"
  | "clauses"
  | "multimedia";

export type PropertyEditFormState = {
  title: string;
  propertyTypeId: number | null;
  modalityId: number | null;
  description: string;
  countryId: number | null;
  stateId: number | null;
  cityId: number | null;
  latitude: string;
  longitude: string;
  city: string;
  neighborhood: string;
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  postalCode: string;
  lotArea: string;
  bedrooms: string;
  bathrooms: string;
  beds: string;
  floors: string;
  parkingSpots: string;
  builtArea: string;
  constructionYear: string;
  orientationId: number | null;
  isFurnished: boolean;
  ceilingHeight: string;
  loadingDocks: string;
  internalOffices: string;
  threePhasePower: boolean;
  landUse: string;
  salePrice: string;
  salePriceIsNegotiable: boolean;
  rentPricesByPeriod: Record<string, string>;
  rentDepositsByPeriod: Record<string, string>;
  enabledRentPeriodIds: number[];
  maintenanceFee: string;
  serviceIds: number[];
  clauses: ClauseEntry[];
  photos: PhotoEntry[];
  isPublicAddress: boolean;
  isFeatured: boolean;
  acceptsPets: boolean;
  internalNotes: string;
};

export const initialPropertyEditFormState: PropertyEditFormState = {
  title: "",
  propertyTypeId: null,
  modalityId: null,
  description: "",
  countryId: null,
  stateId: null,
  cityId: null,
  latitude: "",
  longitude: "",
  city: "",
  neighborhood: "",
  street: "",
  exteriorNumber: "",
  interiorNumber: "",
  postalCode: "",
  lotArea: "",
  bedrooms: "",
  bathrooms: "",
  beds: "",
  floors: "",
  parkingSpots: "",
  builtArea: "",
  constructionYear: "",
  orientationId: null,
  isFurnished: false,
  ceilingHeight: "",
  loadingDocks: "",
  internalOffices: "",
  threePhasePower: false,
  landUse: "",
  salePrice: "",
  salePriceIsNegotiable: false,
  rentPricesByPeriod: {},
  rentDepositsByPeriod: {},
  enabledRentPeriodIds: [],
  maintenanceFee: "",
  serviceIds: [],
  clauses: [],
  photos: [],
  isPublicAddress: true,
  isFeatured: false,
  acceptsPets: true,
  internalNotes: "",
};

export type PatchPropertyEditForm = (
  patch: Partial<PropertyEditFormState>,
) => void;
