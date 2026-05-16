"use client";

import { httpClient } from "@lib/http/http-client";

import type {
  UpdatePropertyInput,
  UpdatePropertyResult,
} from "@properties/domain/property.entity";
import type { PropertyRepository } from "@properties/domain/property.repository";

export const propertyPatchHttpAdapter: Pick<
  PropertyRepository,
  "updateProperty"
> = {
  async updateProperty(
    uuid: string,
    input: UpdatePropertyInput,
  ): Promise<UpdatePropertyResult> {
    const body: Record<string, unknown> = {};

    if (input.title !== undefined) body.title = input.title;
    if (input.description !== undefined) body.description = input.description;
    if (input.lotArea !== undefined) body.lot_area = input.lotArea;
    if (input.isFeatured !== undefined) body.is_featured = input.isFeatured;

    if (input.residential !== undefined) {
      body.residential = {
        bedrooms: input.residential.bedrooms,
        bathrooms: input.residential.bathrooms,
        beds: input.residential.beds,
        floors: input.residential.floors,
        parking_spots: input.residential.parkingSpots,
        built_area: input.residential.builtArea,
        construction_year: input.residential.constructionYear,
        orientation_id: input.residential.orientationId,
        is_furnished: input.residential.isFurnished,
      };
    }

    if (input.commercial !== undefined) {
      body.commercial = {
        ceiling_height: input.commercial.ceilingHeight,
        loading_docks: input.commercial.loadingDocks,
        internal_offices: input.commercial.internalOffices,
        three_phase_power: input.commercial.threePhasePower,
        land_use: input.commercial.landUse,
      };
    }

    if (input.location !== undefined) {
      body.location = {
        city_id: input.location.cityId,
        neighborhood: input.location.neighborhood,
        street: input.location.street,
        exterior_number: input.location.exteriorNumber,
        postal_code: input.location.postalCode,
        latitude: input.location.latitude,
        longitude: input.location.longitude,
        is_public_address: input.location.isPublicAddress,
        ...(input.location.interiorNumber !== undefined && {
          interior_number: input.location.interiorNumber,
        }),
      };
    }

    return await httpClient.patch<UpdatePropertyResult>(
      `/api/v1/properties/${uuid}`,
      body,
    );
  },
};
