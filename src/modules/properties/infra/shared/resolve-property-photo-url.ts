"use client";

import { env } from "@/config/env";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, "");
}

export function resolvePropertyPhotoUrl(
  value: string | null | undefined,
  propertyUuid?: string,
) {
  if (!value || value.trim() === "") {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedBaseUrl = trimTrailingSlash(env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL);
  const normalizedValue = trimLeadingSlash(value.trim());

  if (normalizedValue.startsWith("properties/")) {
    return `${normalizedBaseUrl}/${normalizedValue}`;
  }

  if (
    propertyUuid &&
    normalizedValue.startsWith(`${propertyUuid}/photos/`)
  ) {
    return `${normalizedBaseUrl}/properties/${normalizedValue}`;
  }

  return `${normalizedBaseUrl}/${normalizedValue}`;
}
