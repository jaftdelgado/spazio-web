"use client";

import type { PropertyType } from "@catalogs/domain/catalog.entity";

export type PropertyTypeKind = "commercial" | "other" | "residential";

export function resolvePropertyTypeKind(
  propertyType: PropertyType | null | undefined,
): PropertyTypeKind {
  return propertyType?.subtype ?? "other";
}
