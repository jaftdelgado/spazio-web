"use client";

import type {
  PropertyPhoto,
  PropertyPhotos,
} from "@properties/domain/property.entity";
import { resolvePropertyPhotoUrl } from "@properties/infra/shared/resolve-property-photo-url";

type PropertyPhotoDTO = {
  photo_id: number;
  storage_key: string;
  url?: string | null;
  mime_type: string;
  sort_order: number;
  is_cover: boolean;
  label?: string | null;
  alt_text?: string | null;
};

type GetPropertyPhotosDTO = {
  data: PropertyPhotoDTO[];
};

const mapPhoto = (dto: PropertyPhotoDTO): PropertyPhoto => ({
  photoId: dto.photo_id,
  storageKey: dto.storage_key,
  url: resolvePropertyPhotoUrl(dto.url ?? dto.storage_key),
  mimeType: dto.mime_type,
  sortOrder: dto.sort_order,
  isCover: dto.is_cover,
  label: dto.label ?? null,
  altText: dto.alt_text ?? null,
});

export const mapPropertyPhotos = (dto: GetPropertyPhotosDTO): PropertyPhotos => ({
  photos: dto.data.map(mapPhoto),
});
