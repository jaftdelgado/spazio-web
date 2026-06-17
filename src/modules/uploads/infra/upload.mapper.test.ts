import {
  mapUploadPhotoResult,
  mapUploadPhotosBatchResult,
} from "./upload.mapper";

describe("upload.mapper", () => {
  it("maps a single upload result", () => {
    expect(
      mapUploadPhotoResult({
        photo_id: 3,
        storage_key: "properties/demo/photo.webp",
        url: "https://cdn.example.com/photo.webp",
      }),
    ).toEqual({
      photoId: 3,
      storageKey: "properties/demo/photo.webp",
      url: "https://cdn.example.com/photo.webp",
    });
  });

  it("maps batch uploads and defaults failed items to an empty array", () => {
    expect(
      mapUploadPhotosBatchResult({
        uploaded: [
          {
            photo_id: 4,
            storage_key: "properties/demo/another.webp",
            url: "https://cdn.example.com/another.webp",
          },
        ],
      }),
    ).toEqual({
      uploaded: [
        {
          photoId: 4,
          storageKey: "properties/demo/another.webp",
          url: "https://cdn.example.com/another.webp",
        },
      ],
      failed: [],
    });
  });
});
