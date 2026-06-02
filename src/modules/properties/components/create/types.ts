export type PropertyCreateSectionId =
  | "general"
  | "location"
  | "pricing"
  | "media"
  | "settings"
  | "notes";

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
  postalCode: string;
  salePrice: string;
  rentPrice: string;
  maintenanceFee: string;
  mediaLabel: string;
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
  postalCode: "",
  salePrice: "",
  rentPrice: "",
  maintenanceFee: "",
  mediaLabel: "",
  isPublicAddress: true,
  isFeatured: false,
  acceptsPets: true,
  internalNotes: "",
};

export type PatchPropertyCreateForm = (
  patch: Partial<PropertyCreateFormState>,
) => void;
