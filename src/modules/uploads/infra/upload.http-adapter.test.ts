import { httpClient } from "@lib/http/http-client";

import { uploadHttpAdapter } from "./upload.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe("uploadHttpAdapter", () => {
  it("uploads one property photo and maps the response", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: {
        photo_id: 1,
        storage_key: "properties/demo/photo.webp",
        url: "https://cdn.example.com/photo.webp",
      },
    });

    const file = new File(["photo"], "photo.webp", { type: "image/webp" });
    const result = await uploadHttpAdapter.uploadPropertyPhoto({
      propertyUuid: "property-1",
      file,
      label: "Front view",
      altText: "Facade",
      sortOrder: 2,
      isCover: true,
    });

    expect(result.photoId).toBe(1);
    expect(httpClient.post).toHaveBeenCalledWith(
      "/api/v1/uploads/properties/property-1/photos",
      expect.any(FormData),
    );
  });

  it("uploads a batch of photos", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: {
        uploaded: [
          {
            photo_id: 2,
            storage_key: "properties/demo/photo-2.webp",
            url: "https://cdn.example.com/photo-2.webp",
          },
        ],
        failed: [{ index: 1, message: "Invalid file" }],
      },
    });

    const file = new File(["photo"], "photo.webp", { type: "image/webp" });
    const result = await uploadHttpAdapter.uploadPropertyPhotos({
      propertyUuid: "property-1",
      files: [file],
    });

    expect(result.uploaded).toHaveLength(1);
    expect(result.failed).toEqual([{ index: 1, message: "Invalid file" }]);
  });
});
