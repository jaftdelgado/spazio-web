"use client";

import type {
  CommercialDetail,
  PropertyCard,
  PropertyCardModality,
  PropertyCardPrice,
  PropertyCardStatus,
  PropertyCardType,
  PropertyDetail,
  PropertyList,
  PropertyListMeta,
  PropertyLocation,
  PropertyPriceHistory,
  PropertyStatusHistory,
  ResidentialDetail,
} from "@properties/domain/property.entity";

type PropertyCardTypeDTO = {
  property_type_id: number;
  name: string;
  icon: string | null;
};

type PropertyCardModalityDTO = {
  modality_id: number;
  name: string;
};

type PropertyCardStatusDTO = {
  status_id: number;
  name: string;
};

type PropertyCardPriceDTO = {
  amount: number;
  currency: string;
  price_type: string;
  period_name: string | null;
} | null;

type PropertyCardDTO = {
  property_uuid: string;
  title: string;
  cover_photo_url: string | null;
  property_type: PropertyCardTypeDTO;
  modality: PropertyCardModalityDTO;
  status: PropertyCardStatusDTO;
  price: PropertyCardPriceDTO;
  bedrooms?: number | null;
  bathrooms?: number | null;
  built_area?: number | null;
};

type ListMetaDTO = {
  total_count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  has_next: boolean;
  has_prev: boolean;
};

type ListPropertiesDTO = {
  data: PropertyCardDTO[];
  meta: ListMetaDTO;
};

type ResidentialDTO = {
  bedrooms: number;
  bathrooms: number;
  beds: number;
  floors: number;
  parking_spots: number;
  built_area: number;
  construction_year: number;
  orientation_id: number;
  is_furnished: boolean;
};

type CommercialDTO = {
  ceiling_height: number;
  loading_docks: number;
  internal_offices: number;
  three_phase_power: boolean;
  land_use: string;
};

type LocationDTO = {
  city_id: number;
  neighborhood: string;
  street: string;
  exterior_number: string;
  interior_number: string | null;
  postal_code: string;
  latitude: number;
  longitude: number;
  is_public_address: boolean;
};

type PropertyDetailDataDTO = {
  property_uuid: string;
  subtype: string;
  title: string;
  description: string;
  property_type_id: number;
  modality_id: number;
  status_id: number;
  lot_area: number;
  is_featured: boolean;
  registered_by?: string;
  residential: ResidentialDTO | null;
  commercial: CommercialDTO | null;
  location: LocationDTO | null;
};

type GetPropertyDTO = {
  data: PropertyDetailDataDTO;
};

type PropertyStatusHistoryDTO = {
  history_id: number;
  property_uuid: string;
  previous_status_name: string;
  new_status_name: string;
  changed_by_name: string;
  changed_at: string;
};

type GetPropertyHistoryDTO = {
  data: PropertyStatusHistoryDTO[];
};

type PropertyPriceHistoryDTO = {
  price_type: string;
  amount: number;
  currency: string;
  period_name: string | null;
  is_negotiable: boolean;
  deposit: number | null;
  valid_from: string;
  valid_until: string | null;
  is_current: boolean;
};

type GetPropertyPricesHistoryDTO = {
  data: PropertyPriceHistoryDTO[];
};

const mapPropertyCardType = (dto: PropertyCardTypeDTO): PropertyCardType => ({
  propertyTypeId: dto.property_type_id,
  name: dto.name,
  icon: dto.icon,
});

const mapPropertyCardModality = (
  dto: PropertyCardModalityDTO,
): PropertyCardModality => ({
  modalityId: dto.modality_id,
  name: dto.name,
});

const mapPropertyCardStatus = (
  dto: PropertyCardStatusDTO,
): PropertyCardStatus => ({
  statusId: dto.status_id,
  name: dto.name,
});

const mapPropertyCardPrice = (
  dto: PropertyCardPriceDTO,
): PropertyCardPrice | null => {
  if (!dto) return null;

  return {
    amount: dto.amount,
    currency: dto.currency,
    priceType: dto.price_type,
    periodName: dto.period_name,
  };
};

const mapPropertyCard = (dto: PropertyCardDTO): PropertyCard => ({
  propertyUuid: dto.property_uuid,
  title: dto.title,
  coverPhotoUrl: dto.cover_photo_url,
  propertyType: mapPropertyCardType(dto.property_type),
  modality: mapPropertyCardModality(dto.modality),
  status: mapPropertyCardStatus(dto.status),
  price: mapPropertyCardPrice(dto.price),
  bedrooms: dto.bedrooms ?? null,
  bathrooms: dto.bathrooms ?? null,
  builtArea: dto.built_area ?? null,
});

const mapPropertyListMeta = (dto: ListMetaDTO): PropertyListMeta => ({
  totalCount: dto.total_count,
  totalPages: dto.total_pages,
  currentPage: dto.current_page,
  pageSize: dto.page_size,
  hasNext: dto.has_next,
  hasPrev: dto.has_prev,
});

export const mapPropertyList = (dto: ListPropertiesDTO): PropertyList => ({
  data: dto.data.map(mapPropertyCard),
  meta: mapPropertyListMeta(dto.meta),
});

const mapResidential = (dto: ResidentialDTO): ResidentialDetail => ({
  bedrooms: dto.bedrooms,
  bathrooms: dto.bathrooms,
  beds: dto.beds,
  floors: dto.floors,
  parkingSpots: dto.parking_spots,
  builtArea: dto.built_area,
  constructionYear: dto.construction_year,
  orientationId: dto.orientation_id,
  isFurnished: dto.is_furnished,
});

const mapCommercial = (dto: CommercialDTO): CommercialDetail => ({
  ceilingHeight: dto.ceiling_height,
  loadingDocks: dto.loading_docks,
  internalOffices: dto.internal_offices,
  threePhasePower: dto.three_phase_power,
  landUse: dto.land_use,
});

const mapLocation = (dto: LocationDTO): PropertyLocation => ({
  cityId: dto.city_id,
  neighborhood: dto.neighborhood,
  street: dto.street,
  exteriorNumber: dto.exterior_number,
  interiorNumber: dto.interior_number,
  postalCode: dto.postal_code,
  latitude: dto.latitude,
  longitude: dto.longitude,
  isPublicAddress: dto.is_public_address,
});

export const mapPropertyDetail = (dto: GetPropertyDTO): PropertyDetail => ({
  propertyUuid: dto.data.property_uuid,
  subtype: dto.data.subtype,
  title: dto.data.title,
  description: dto.data.description,
  propertyTypeId: dto.data.property_type_id,
  modalityId: dto.data.modality_id,
  statusId: dto.data.status_id,
  lotArea: dto.data.lot_area,
  isFeatured: dto.data.is_featured,
  registeredBy: dto.data.registered_by ?? "",
  residential: dto.data.residential ? mapResidential(dto.data.residential) : null,
  commercial: dto.data.commercial ? mapCommercial(dto.data.commercial) : null,
  location: dto.data.location ? mapLocation(dto.data.location) : null,
});

export const mapPropertyHistoryList = (
  dto: GetPropertyHistoryDTO,
): PropertyStatusHistory[] =>
  dto.data.map((item) => ({
    historyId: item.history_id,
    propertyUuid: item.property_uuid,
    previousStatusName: item.previous_status_name,
    newStatusName: item.new_status_name,
    changedByName: item.changed_by_name,
    changedAt: item.changed_at,
  }));

export const mapPropertyPricesHistoryList = (
  dto: GetPropertyPricesHistoryDTO,
): PropertyPriceHistory[] =>
  dto.data.map((item) => ({
    priceType: item.price_type,
    amount: item.amount,
    currency: item.currency,
    periodName: item.period_name,
    isNegotiable: item.is_negotiable,
    deposit: item.deposit,
    validFrom: item.valid_from,
    validUntil: item.valid_until,
    isCurrent: item.is_current,
  }));
