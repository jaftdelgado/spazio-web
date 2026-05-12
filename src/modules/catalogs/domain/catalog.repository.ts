"use client";

import type {
  Modality,
  Orientation,
  PropertyType,
  RentPeriod,
} from "./catalog.entity";

export interface CatalogRepository {
  listModalities(): Promise<Modality[]>;
  listPropertyTypes(): Promise<PropertyType[]>;
  listRentPeriods(propertyTypeId: number): Promise<RentPeriod[]>;
  listOrientations(): Promise<Orientation[]>;
}
