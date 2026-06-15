"use client";

import { httpClient } from "@lib/http/http-client";

import type { UploadRepository } from "@uploads/domain/upload.repository";
import {
  mapUploadPhotoResult,
  mapUploadPhotosBatchResult,
} from "@uploads/infra/upload.mapper";

type UploadPhotoResultDTO = Parameters<typeof mapUploadPhotoResult>[0];
type UploadPhotosBatchResultDTO = Parameters<
  typeof mapUploadPhotosBatchResult
>[0];

type UploadPhotoResponse = {
  data: UploadPhotoResultDTO;
};

type UploadPhotosBatchResponse = {
  data: UploadPhotosBatchResultDTO;
};

export const uploadHttpAdapter: UploadRepository = {
  async uploadPropertyPhoto(params) {
    const formData = new FormData();

    formData.append("file", params.file);

    if (params.label !== undefined && params.label.trim() !== "") {
      formData.append("label", params.label);
    }

    if (params.altText !== undefined && params.altText.trim() !== "") {
      formData.append("alt_text", params.altText);
    }

    if (params.sortOrder !== undefined) {
      formData.append("sort_order", String(params.sortOrder));
    }

    if (params.isCover !== undefined) {
      formData.append("is_cover", String(params.isCover));
    }

    const response = await httpClient.post<UploadPhotoResponse>(
      `/api/v1/uploads/properties/${params.propertyUuid}/photos`,
      formData,
    );

    return mapUploadPhotoResult(response.data);
  },

  async uploadPropertyPhotos(params) {
    const formData = new FormData();

    params.files.forEach((file) => {
      formData.append("file", file);
    });

    const response = await httpClient.post<UploadPhotosBatchResponse>(
      `/api/v1/uploads/properties/${params.propertyUuid}/photos/batch`,
      formData,
    );

    return mapUploadPhotosBatchResult(response.data);
  },
};
