"use client";

import type {
  UploadPhotoBatchError,
  UploadPhotoParams,
  UploadPhotoResult,
  UploadPhotosBatchResult,
  UploadPhotosParams,
} from "@uploads/domain/upload.entity";

export interface UploadRepository {
  uploadPropertyPhoto(params: UploadPhotoParams): Promise<UploadPhotoResult>;
  uploadPropertyPhotos(
    params: UploadPhotosParams,
  ): Promise<UploadPhotosBatchResult>;
}
