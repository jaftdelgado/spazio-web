"use client";

import { httpClient } from "@lib/http/http-client";

import type { UpdatePropertyClausesInput } from "@properties/domain/property.entity";
import type { PropertyRepository } from "@properties/domain/property.repository";
import { mapPropertyClauses } from "./property-clauses.mapper";

export const propertyClausesHttpAdapter: Pick<
  PropertyRepository,
  "getPropertyClauses" | "updatePropertyClauses"
> = {
  async getPropertyClauses(uuid: string) {
    const response = await httpClient.get<unknown>(
      `/api/v1/properties/${uuid}/clauses`,
    );

    return mapPropertyClauses(
      response as Parameters<typeof mapPropertyClauses>[0],
    );
  },

  async updatePropertyClauses(uuid: string, input: UpdatePropertyClausesInput) {
    await httpClient.put<void>(`/api/v1/properties/${uuid}/clauses`, {
      clauses: input.clauses.map((clause) => ({
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
      })),
    });
  },
};
