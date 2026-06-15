import type { ClauseEntry } from "@clauses/domain/clause.entity";

export type PhotoEntry = {
  file: File;
  previewUrl: string;
  label: string;
  altText: string;
  isCover: boolean;
};

export type PropertyCreateSectionId =
  | "general"
  | "location"
  | "pricing"
  | "services"
  | "clauses"
  | "multimedia";

export type PropertyCreateFormState = {
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
  orientationId: number | null;
  salePrice: string;
  rentPricesByPeriod: Record<string, string>;
  maintenanceFee: string;
  serviceIds: number[];
  clauses: ClauseEntry[];
  photos: PhotoEntry[];
  isPublicAddress: boolean;
  isFeatured: boolean;
  acceptsPets: boolean;
  internalNotes: string;
};

export const initialPropertyCreateFormState: PropertyCreateFormState = {
  title: "Casa en Bosques del Lago",
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
  orientationId: null,
  salePrice: "",
  rentPricesByPeriod: {},
  maintenanceFee: "",
  serviceIds: [],
  clauses: [],
  photos: [],
  isPublicAddress: true,
  isFeatured: false,
  acceptsPets: true,
  internalNotes: "",
};

export type PatchPropertyCreateForm = (
  patch: Partial<PropertyCreateFormState>,
) => void;
