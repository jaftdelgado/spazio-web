"use client";

import { httpClient } from "@lib/http/http-client";

import type { DeletePropertyInput } from "@properties/domain/property.entity";
import type { PropertyRepository } from "@properties/domain/property.repository";

export const propertyDeleteHttpAdapter: Pick<
  PropertyRepository,
  "deleteProperty"
> = {
  async deleteProperty(uuid: string, input: DeletePropertyInput) {
    await httpClient.delete<void>(`/api/v1/properties/${uuid}`, {
      confirm: input.confirm,
    });
  },
};
