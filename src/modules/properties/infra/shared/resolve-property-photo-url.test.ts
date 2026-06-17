import { resolvePropertyPhotoUrl } from "./resolve-property-photo-url";

describe("resolvePropertyPhotoUrl", () => {
  it("returns null for empty values", () => {
    expect(resolvePropertyPhotoUrl("")).toBeNull();
    expect(resolvePropertyPhotoUrl(null)).toBeNull();
  });

  it("returns absolute urls unchanged", () => {
    expect(resolvePropertyPhotoUrl("https://cdn.example.com/photo.webp")).toBe(
      "https://cdn.example.com/photo.webp",
    );
  });

  it("prefixes property paths with the public base url", () => {
    expect(resolvePropertyPhotoUrl("properties/demo/photo.webp")).toBe(
      "https://pub-ab9b26339b564d53b2f5ec019d1ca830.r2.dev/properties/demo/photo.webp",
    );
  });

  it("prefixes relative property photo paths using the property uuid", () => {
    expect(
      resolvePropertyPhotoUrl("uuid-1/photos/cover.webp", "uuid-1"),
    ).toBe(
      "https://pub-ab9b26339b564d53b2f5ec019d1ca830.r2.dev/properties/uuid-1/photos/cover.webp",
    );
  });
});
