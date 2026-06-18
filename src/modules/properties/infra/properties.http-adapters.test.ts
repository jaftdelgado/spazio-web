import { httpClient } from "@lib/http/http-client";
import { propertyClausesHttpAdapter } from "@properties/infra/clauses/property-clauses.http-adapter";
import { propertyDeleteHttpAdapter } from "@properties/infra/delete/property-delete.http-adapter";
import { propertyGetHttpAdapter } from "@properties/infra/get/property-get.http-adapter";
import { propertyPatchHttpAdapter } from "@properties/infra/patch/property-patch.http-adapter";
import { propertyPhotosHttpAdapter } from "@properties/infra/photos/property-photos.http-adapter";
import { propertyPostHttpAdapter } from "@properties/infra/post/property-post.http-adapter";
import { propertyPricesHttpAdapter } from "@properties/infra/prices/property-prices.http-adapter";
import { propertyServicesHttpAdapter } from "@properties/infra/services/property-services.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("property http adapters", () => {
  it("serializes list filters in the get adapter", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [],
      meta: {
        total_count: 0,
        total_pages: 0,
        current_page: 1,
        page_size: 10,
        has_next: false,
        has_prev: false,
      },
    });

    await propertyGetHttpAdapter.listProperties({
      q: "demo",
      propertyTypeId: 2,
      statusId: [1, 4],
      isFeatured: true,
    });

    expect(httpClient.get).toHaveBeenCalledWith(
      "/api/v1/properties?q=demo&property_type_id=2&is_featured=true&status_id=1&status_id=4",
    );
  });

  it("builds a property creation payload", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { property_uuid: "uuid-1" },
    });

    const result = await propertyPostHttpAdapter.createProperty({
      title: "Demo",
      description: "Description",
      propertyTypeId: 2,
      modalityId: 3,
      agentId: 21,
      lotArea: 120,
      isFeatured: true,
      location: {
        cityId: 9,
        neighborhood: "Roma",
        street: "Street",
        exteriorNumber: "10",
        postalCode: "01000",
        latitude: 19.4,
        longitude: -99.1,
        isPublicAddress: true,
      },
      services: [1, 2],
      clauses: [{ clauseId: 8, booleanValue: true }],
    });

    expect(result).toEqual({ propertyUuid: "uuid-1" });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/api/v1/properties",
      expect.objectContaining({
        title: "Demo",
        agent_id: 21,
        services: [1, 2],
        clauses: [{ clause_id: 8, boolean_value: true }],
      }),
    );
  });

  it("builds patch and delete payloads", async () => {
    vi.mocked(httpClient.patch).mockResolvedValue({ updated: true });
    vi.mocked(httpClient.delete).mockResolvedValue(undefined);

    await propertyPatchHttpAdapter.updateProperty("uuid-1", {
      title: "Updated",
      agentId: 21,
      location: {
        cityId: 9,
        neighborhood: "Roma",
        street: "Street",
        exteriorNumber: "10",
        postalCode: "01000",
        latitude: 19.4,
        longitude: -99.1,
        isPublicAddress: false,
      },
    });
    await propertyDeleteHttpAdapter.deleteProperty("uuid-1", { confirm: true });

    expect(httpClient.patch).toHaveBeenCalledWith(
      "/api/v1/properties/uuid-1",
      expect.objectContaining({
        title: "Updated",
        agent_id: 21,
        location: expect.objectContaining({ city_id: 9 }),
      }),
    );
    expect(httpClient.delete).toHaveBeenCalledWith("/api/v1/properties/uuid-1", {
      confirm: true,
    });
  });

  it("sends agent_id as null when unassigning an agent", async () => {
    vi.mocked(httpClient.patch).mockResolvedValue({ updated: true });

    await propertyPatchHttpAdapter.updateProperty("uuid-1", {
      agentId: null,
    });

    expect(httpClient.patch).toHaveBeenCalledWith("/api/v1/properties/uuid-1", {
      agent_id: null,
    });
  });

  it("updates prices, photos, clauses, and services", async () => {
    vi.mocked(httpClient.put).mockResolvedValue(undefined);

    await propertyPricesHttpAdapter.updatePropertyPrices("uuid-1", {
      salePrice: {
        salePrice: 1000000,
        currency: "MXN",
        isNegotiable: false,
      },
      rentPrices: [],
    });
    await propertyPhotosHttpAdapter.updatePropertyPhotos("uuid-1", {
      photos: [{ photoId: 1, sortOrder: 1, isCover: true, label: "Front" }],
    });
    await propertyClausesHttpAdapter.updatePropertyClauses("uuid-1", {
      clauses: [{ clauseId: 2, minValue: 1, maxValue: 6 }],
    });
    await propertyServicesHttpAdapter.updatePropertyServices("uuid-1", {
      serviceIds: [1, 2],
    });

    expect(httpClient.put).toHaveBeenNthCalledWith(
      1,
      "/api/v1/properties/uuid-1/prices",
      expect.objectContaining({
        sale_price: { sale_price: 1000000, is_negotiable: false },
      }),
    );
    expect(httpClient.put).toHaveBeenNthCalledWith(
      2,
      "/api/v1/properties/uuid-1/photos",
      {
        photos: [
          { photo_id: 1, sort_order: 1, is_cover: true, label: "Front" },
        ],
      },
    );
    expect(httpClient.put).toHaveBeenNthCalledWith(
      3,
      "/api/v1/properties/uuid-1/clauses",
      {
        clauses: [{ clause_id: 2, min_value: 1, max_value: 6 }],
      },
    );
    expect(httpClient.put).toHaveBeenNthCalledWith(
      4,
      "/api/v1/properties/uuid-1/services",
      { service_ids: [1, 2] },
    );
  });
});
