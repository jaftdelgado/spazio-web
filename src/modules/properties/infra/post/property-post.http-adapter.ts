"use client";

import { httpClient } from "@lib/http/http-client";

import type {
  CreatePropertyInput,
  CreatePropertyResult,
} from "@properties/domain/property.entity";
import type { PropertyRepository } from "@properties/domain/property.repository";

export const propertyPostHttpAdapter: Pick<
  PropertyRepository,
  "createProperty"
> = {
  async createProperty(input: CreatePropertyInput): Promise<CreatePropertyResult> {
    const body: Record<string, unknown> = {
      subtype: input.subtype,
      title: input.title,
      description: input.description,
      property_type_id: input.propertyTypeId,
      modality_id: input.modalityId,
      lot_area: input.lotArea,
      is_featured: input.isFeatured,
      location: {
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
      },
    };

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

    if (input.salePrice !== undefined) {
      body.sale_price = {
        sale_price: input.salePrice.salePrice,
        currency: input.salePrice.currency,
        is_negotiable: input.salePrice.isNegotiable,
      };
    }

    if (input.rentPrices !== undefined && input.rentPrices.length > 0) {
      body.rent_prices = input.rentPrices.map((rentPrice) => ({
        period_id: rentPrice.periodId,
        rent_price: rentPrice.rentPrice,
        currency: rentPrice.currency,
        is_negotiable: rentPrice.isNegotiable,
        ...(rentPrice.deposit !== undefined && { deposit: rentPrice.deposit }),
      }));
    }

    if (input.services !== undefined && input.services.length > 0) {
      body.services = input.services;
    }

    if (input.clauses !== undefined && input.clauses.length > 0) {
      body.clauses = input.clauses.map((clause) => ({
        clause_id: clause.clauseId,
        ...(clause.booleanValue !== undefined && {
          boolean_value: clause.booleanValue,
        }),
        ...(clause.integerValue !== undefined && {
          integer_value: clause.integerValue,
        }),
        ...(clause.minValue !== undefined && {
          min_value: clause.minValue,
        }),
        ...(clause.maxValue !== undefined && {
          max_value: clause.maxValue,
        }),
      }));
    }

    const response = await httpClient.post<{ data: { property_uuid: string } }>(
      "/api/v1/properties",
      body,
    );

    return { propertyUuid: response.data.property_uuid };
  },
};
