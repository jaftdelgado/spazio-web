"use client";

import type {
  Modality,
  Orientation,
  PropertyType,
  RentPeriod,
} from "@catalogs/domain/catalog.entity";

type ModalityDTO = {
  modality_id: number;
  name: string;
};

type PropertyTypeDTO = {
  property_type_id: number;
  name: string;
  icon: string | null;
  subtype: "commercial" | "other" | "residential";
};

type RentPeriodDTO = {
  period_id: number;
  name: string;
};

type OrientationDTO = {
  orientation_id: number;
  name: string;
};

export const mapModality = (dto: ModalityDTO): Modality => {
  return {
    modalityId: dto.modality_id,
    name: dto.name,
  };
};

export const mapPropertyType = (dto: PropertyTypeDTO): PropertyType => {
  return {
    propertyTypeId: dto.property_type_id,
    name: dto.name,
    icon: dto.icon,
    subtype: dto.subtype,
  };
};

export const mapRentPeriod = (dto: RentPeriodDTO): RentPeriod => {
  return {
    periodId: dto.period_id,
    name: dto.name,
  };
};

export const mapOrientation = (dto: OrientationDTO): Orientation => {
  return {
    orientationId: dto.orientation_id,
    name: dto.name,
  };
};
