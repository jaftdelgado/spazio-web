import { httpClient } from "@lib/http/http-client";

import { catalogHttpAdapter } from "./catalog.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe("catalogHttpAdapter", () => {
  it("lists modalities", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [{ modality_id: 1, name: "Sale" }],
    });

    await expect(catalogHttpAdapter.listModalities()).resolves.toEqual([
      { modalityId: 1, name: "Sale" },
    ]);
  });

  it("builds the rent periods query string", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [{ period_id: 2, name: "Monthly" }],
    });

    await catalogHttpAdapter.listRentPeriods(7);

    expect(httpClient.get).toHaveBeenCalledWith(
      "/api/v1/catalogs/rent-periods?property_type_id=7",
    );
  });

  it("throws for invalid rent period property type ids", async () => {
    await expect(catalogHttpAdapter.listRentPeriods(0)).rejects.toThrow(
      "propertyTypeId must be a positive integer.",
    );
  });
});
