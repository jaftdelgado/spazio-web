"use client";

import type {
  CreatePropertyInput,
  CreatePropertyResult,
  DeletePropertyInput,
  PropertyClauses,
  PropertyDetail,
  PropertyList,
  PropertyPhotos,
  PropertyPrices,
  PropertyPriceHistory,
  PropertyServices,
  PropertyStatusHistory,
  UpdatePropertyClausesInput,
  UpdatePropertyInput,
  UpdatePropertyPhotosInput,
  UpdatePropertyPricesInput,
  UpdatePropertyResult,
  UpdatePropertyServicesInput,
} from "./property.entity";

export interface PropertyListFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  statusId?: number[];
  propertyTypeId?: number;
  modalityId?: number;
  countryId?: number;
  stateId?: number;
  cityId?: number;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  sort?: "created_at" | "title" | "price";
  order?: "asc" | "desc";
}

export interface PropertyRepository {
  listProperties(filters: PropertyListFilters): Promise<PropertyList>;
  getProperty(uuid: string): Promise<PropertyDetail>;
  getPropertyHistory(uuid: string): Promise<PropertyStatusHistory[]>;
  getPropertyPricesHistory(uuid: string): Promise<PropertyPriceHistory[]>;
  getPropertyServices(uuid: string): Promise<PropertyServices>;
  getPropertyPrices(uuid: string): Promise<PropertyPrices>;
  updatePropertyServices(
    uuid: string,
    input: UpdatePropertyServicesInput,
  ): Promise<void>;
  updatePropertyPrices(
    uuid: string,
    input: UpdatePropertyPricesInput,
  ): Promise<void>;
  getPropertyClauses(uuid: string): Promise<PropertyClauses>;
  updatePropertyClauses(
    uuid: string,
    input: UpdatePropertyClausesInput,
  ): Promise<void>;
  deleteProperty(uuid: string, input: DeletePropertyInput): Promise<void>;
  getPropertyPhotos(uuid: string): Promise<PropertyPhotos>;
  updatePropertyPhotos(
    uuid: string,
    input: UpdatePropertyPhotosInput,
  ): Promise<void>;
  updateProperty(
    uuid: string,
    input: UpdatePropertyInput,
  ): Promise<UpdatePropertyResult>;
  createProperty(input: CreatePropertyInput): Promise<CreatePropertyResult>;
}
