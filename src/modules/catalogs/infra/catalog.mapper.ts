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
  subtype?: "commercial" | "other" | "residential";
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

const normalizePropertyTypeToken = (value: string | null | undefined) => {
  return (value ?? "").trim().toLowerCase();
};

const resolvePropertyTypeSubtype = (
  dto: PropertyTypeDTO,
): PropertyType["subtype"] => {
  if (dto.subtype !== undefined) {
    return dto.subtype;
  }

  const iconToken = normalizePropertyTypeToken(dto.icon?.split("/").pop());
  const nameToken = normalizePropertyTypeToken(dto.name);

  if (
    iconToken.includes("commercial") ||
    nameToken.includes("commercial") ||
    nameToken.includes("comercial")
  ) {
    return "commercial";
  }

  if (
    iconToken.includes("house") ||
    iconToken.includes("apartment") ||
    nameToken.includes("house") ||
    nameToken.includes("casa") ||
    nameToken.includes("apartment") ||
    nameToken.includes("departamento")
  ) {
    return "residential";
  }

  return "other";
};

export const mapPropertyType = (dto: PropertyTypeDTO): PropertyType => {
  return {
    propertyTypeId: dto.property_type_id,
    name: dto.name,
    icon: dto.icon,
    subtype: resolvePropertyTypeSubtype(dto),
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
