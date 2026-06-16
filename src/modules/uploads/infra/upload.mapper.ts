"use client";

import type {
  UploadPhotoBatchError,
  UploadPhotoResult,
  UploadPhotosBatchResult,
} from "@uploads/domain/upload.entity";

type UploadPhotoResultDTO = {
  photo_id: number;
  storage_key: string;
  url: string;
};

type UploadPhotoBatchErrorDTO = {
  index: number;
  message: string;
};

type UploadPhotosBatchResultDTO = {
  uploaded: UploadPhotoResultDTO[];
  failed?: UploadPhotoBatchErrorDTO[];
};

export const mapUploadPhotoResult = (
  dto: UploadPhotoResultDTO,
): UploadPhotoResult => {
  return {
    photoId: dto.photo_id,
    storageKey: dto.storage_key,
    url: dto.url,
  };
};

const mapUploadPhotoBatchError = (
  dto: UploadPhotoBatchErrorDTO,
): UploadPhotoBatchError => {
  return {
    index: dto.index,
    message: dto.message,
  };
};

export const mapUploadPhotosBatchResult = (
  dto: UploadPhotosBatchResultDTO,
): UploadPhotosBatchResult => {
  return {
    uploaded: dto.uploaded.map(mapUploadPhotoResult),
    failed: (dto.failed ?? []).map(mapUploadPhotoBatchError),
  };
};
