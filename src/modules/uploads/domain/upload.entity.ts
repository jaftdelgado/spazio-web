"use client";

export interface UploadPhotoResult {
  photoId: number;
  storageKey: string;
  url: string;
}

export interface UploadPhotoBatchError {
  index: number;
  message: string;
}

export interface UploadPhotosBatchResult {
  uploaded: UploadPhotoResult[];
  failed: UploadPhotoBatchError[];
}

export interface UploadPhotoParams {
  propertyUuid: string;
  file: File;
  label?: string;
  altText?: string;
  sortOrder?: number;
  isCover?: boolean;
}

export interface UploadPhotosParams {
  propertyUuid: string;
  files: File[];
}
