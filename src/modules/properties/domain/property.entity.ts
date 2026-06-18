"use client";

export interface PropertyCardPrice {
  amount: number;
  currency: string;
  priceType: string;
  periodName: string | null;
}

export interface PropertyCardType {
  propertyTypeId: number;
  name: string;
  icon: string | null;
}

export interface PropertyCardModality {
  modalityId: number;
  name: string;
}

export interface PropertyCardStatus {
  statusId: number;
  name: string;
}

export interface AssignedAgent {
  userId: number;
  userUuid: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
}

export interface PropertyCard {
  propertyId: number;
  propertyUuid: string;
  title: string;
  coverPhotoUrl: string | null;
  isFeatured: boolean;
  petFriendly: boolean;
  propertyType: PropertyCardType;
  modality: PropertyCardModality;
  status: PropertyCardStatus;
  assignedAgent?: AssignedAgent;
  price: PropertyCardPrice | null;
  location: PropertyCardLocation | null;
  city: string | null;
  neighborhood: string | null;
  addressSummary: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpots: number | null;
  builtArea: number | null;
}

export interface PropertyCardLocation {
  countryId: number;
  countryName: string;
  stateId: number;
  stateName: string;
  cityId: number;
  cityName: string;
}

export interface PropertyListMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PropertyList {
  data: PropertyCard[];
  meta: PropertyListMeta;
}

export interface ResidentialDetail {
  bedrooms: number;
  bathrooms: number;
  beds: number;
  floors: number;
  parkingSpots: number;
  builtArea: number;
  constructionYear: number;
  orientationId: number;
  isFurnished: boolean;
}

export interface CommercialDetail {
  ceilingHeight: number;
  loadingDocks: number;
  internalOffices: number;
  threePhasePower: boolean;
  landUse: string;
}

export interface PropertyLocation {
  countryId: number;
  countryName: string;
  stateId: number;
  stateName: string;
  cityId: number;
  cityName: string;
  neighborhood: string;
  street: string;
  exteriorNumber: string;
  interiorNumber: string | null;
  postalCode: string;
  latitude: number;
  longitude: number;
  isPublicAddress: boolean;
}

export interface PropertyDetail {
  propertyUuid: string;
  subtype: string;
  title: string;
  description: string;
  propertyTypeId: number;
  modalityId: number;
  statusId: number;
  lotArea: number;
  isFeatured: boolean;
  registeredBy: string;
  assignedAgent?: AssignedAgent;
  residential: ResidentialDetail | null;
  commercial: CommercialDetail | null;
  location: PropertyLocation | null;
}

export interface PropertyStatusHistory {
  historyId: number;
  propertyUuid: string;
  previousStatusName: string;
  newStatusName: string;
  changedByName: string;
  changedAt: string;
}

export interface PropertyPriceHistory {
  priceType: string;
  amount: number;
  currency: string;
  periodName: string | null;
  isNegotiable: boolean;
  deposit: number | null;
  validFrom: string;
  validUntil: string | null;
  isCurrent: boolean;
}

export interface PropertyServices {
  serviceIds: number[];
}

export interface UpdatePropertyServicesInput {
  serviceIds: number[];
}

export interface ActiveSalePrice {
  salePrice: number;
  currency: string;
  isNegotiable: boolean;
}

export interface ActiveRentPrice {
  periodId: number;
  rentPrice: number;
  deposit: number | null;
  currency: string;
  isNegotiable: boolean;
}

export interface PropertyPrices {
  salePrice: ActiveSalePrice | null;
  rentPrices: ActiveRentPrice[];
}

export interface UpdateSalePriceInput {
  salePrice: number;
  isNegotiable: boolean;
}

export interface UpdateRentPriceInput {
  periodId: number;
  rentPrice: number;
  deposit?: number;
  isNegotiable: boolean;
}

export interface UpdatePropertyPricesInput {
  salePrice?: UpdateSalePriceInput;
  rentPrices?: UpdateRentPriceInput[];
}

export type PropertyClause = {
  clauseId: number;
  booleanValue: boolean | null;
  integerValue: number | null;
  minValue: number | null;
  maxValue: number | null;
};

export type PropertyClauses = {
  clauses: PropertyClause[];
};

export type UpdatePropertyClausesInput = {
  clauses: {
    clauseId: number;
    booleanValue?: boolean;
    integerValue?: number;
    minValue?: number;
    maxValue?: number;
  }[];
};

export type DeletePropertyInput = {
  confirm: boolean;
};

export type PropertyPhoto = {
  photoId: number;
  storageKey: string;
  url: string | null;
  mimeType: string;
  sortOrder: number;
  isCover: boolean;
  label: string | null;
  altText: string | null;
};

export type PropertyPhotos = {
  photos: PropertyPhoto[];
};

export type UpdatePhotoMetadataInput = {
  photoId: number;
  sortOrder: number;
  isCover: boolean;
  label?: string;
  altText?: string;
};

export type UpdatePropertyPhotosInput = {
  photos: UpdatePhotoMetadataInput[];
};

export type UpdateResidentialInput = {
  bedrooms: number;
  bathrooms: number;
  beds: number;
  floors: number;
  parkingSpots: number;
  builtArea: number;
  constructionYear: number;
  orientationId: number;
  isFurnished: boolean;
};

export type UpdateCommercialInput = {
  ceilingHeight: number;
  loadingDocks: number;
  internalOffices: number;
  threePhasePower: boolean;
  landUse: string;
};

export type UpdateLocationInput = {
  cityId: number;
  neighborhood: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isPublicAddress: boolean;
};

export type UpdatePropertyInput = {
  title?: string;
  description?: string;
  lotArea?: number;
  isFeatured?: boolean;
  agentId?: number;
  residential?: UpdateResidentialInput;
  commercial?: UpdateCommercialInput;
  location?: UpdateLocationInput;
};

export type UpdatePropertyResult = {
  message: string;
};

export type CreateResidentialInput = {
  bedrooms: number;
  bathrooms: number;
  beds: number;
  floors: number;
  parkingSpots: number;
  builtArea: number;
  constructionYear: number;
  orientationId: number;
  isFurnished: boolean;
};

export type CreateCommercialInput = {
  ceilingHeight: number;
  loadingDocks: number;
  internalOffices: number;
  threePhasePower: boolean;
  landUse: string;
};

export type CreateLocationInput = {
  cityId: number;
  neighborhood: string;
  street: string;
  exteriorNumber: string;
  interiorNumber?: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isPublicAddress: boolean;
};

export type CreateSalePriceInput = {
  salePrice: number;
  currency: string;
  isNegotiable: boolean;
};

export type CreateRentPriceInput = {
  periodId: number;
  rentPrice: number;
  deposit?: number;
  currency: string;
  isNegotiable: boolean;
};

export type CreatePropertyClauseInput = {
  clauseId: number;
  booleanValue?: boolean;
  integerValue?: number;
  minValue?: number;
  maxValue?: number;
};

export type CreatePropertyInput = {
  title: string;
  description: string;
  propertyTypeId: number;
  modalityId: number;
  agentId?: number;
  lotArea: number;
  isFeatured: boolean;
  residential?: CreateResidentialInput;
  commercial?: CreateCommercialInput;
  location: CreateLocationInput;
  salePrice?: CreateSalePriceInput;
  rentPrices?: CreateRentPriceInput[];
  services?: number[];
  clauses?: CreatePropertyClauseInput[];
};

export type CreatePropertyResult = {
  propertyUuid: string;
};
