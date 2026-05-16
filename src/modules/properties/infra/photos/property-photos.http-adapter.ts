"use client";

import { httpClient } from "@lib/http/http-client";

import type { UpdatePropertyPhotosInput } from "@properties/domain/property.entity";
import type { PropertyRepository } from "@properties/domain/property.repository";
import { mapPropertyPhotos } from "./property-photos.mapper";

export const propertyPhotosHttpAdapter: Pick<
  PropertyRepository,
  "getPropertyPhotos" | "updatePropertyPhotos"
> = {
  async getPropertyPhotos(uuid: string) {
    const response = await httpClient.get<unknown>(
      `/api/v1/properties/${uuid}/photos`,
    );

    return mapPropertyPhotos(
      response as Parameters<typeof mapPropertyPhotos>[0],
    );
  },

  async updatePropertyPhotos(uuid: string, input: UpdatePropertyPhotosInput) {
    await httpClient.put<void>(`/api/v1/properties/${uuid}/photos`, {
      photos: input.photos.map((photo) => ({
        photo_id: photo.photoId,
        sort_order: photo.sortOrder,
        is_cover: photo.isCover,
        ...(photo.label !== undefined && { label: photo.label }),
        ...(photo.altText !== undefined && { alt_text: photo.altText }),
      })),
    });
  },
};
