"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { UpdatePropertyPhotosInput } from "@properties/domain/property.entity";
import { propertyPhotosHttpAdapter } from "@properties/photos/infra/property-photos.http-adapter";

export const usePropertyPhotos = (uuid: string) => {
  return useQuery({
    queryKey: ["properties", "photos", uuid],
    queryFn: () => propertyPhotosHttpAdapter.getPropertyPhotos(uuid),
    enabled: uuid.length > 0,
  });
};

export const useUpdatePropertyPhotos = (uuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePropertyPhotosInput) =>
      propertyPhotosHttpAdapter.updatePropertyPhotos(uuid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["properties", "photos", uuid],
      });
      queryClient.invalidateQueries({
        queryKey: ["properties", "detail", uuid],
      });
    },
  });
};
