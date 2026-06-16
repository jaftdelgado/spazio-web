"use client";

export interface Modality {
  modalityId: number;
  name: string;
}

export interface PropertyType {
  propertyTypeId: number;
  name: string;
  icon: string | null;
  subtype: "commercial" | "other" | "residential";
}

export interface RentPeriod {
  periodId: number;
  name: string;
}

export interface Orientation {
  orientationId: number;
  name: string;
}
