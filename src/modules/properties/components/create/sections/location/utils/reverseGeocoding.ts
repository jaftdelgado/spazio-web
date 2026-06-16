"use client";

import type { ReverseGeocodeResponse } from "../types/location.types";

export async function reverseGeocodeCoordinates(
  latitude: string,
  longitude: string,
) {
  const searchParams = new URLSearchParams({
    addressdetails: "1",
    format: "jsonv2",
    lat: latitude,
    lon: longitude,
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Reverse geocoding failed.");
  }

  return (await response.json()) as ReverseGeocodeResponse;
}
