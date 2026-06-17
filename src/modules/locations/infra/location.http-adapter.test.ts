import { httpClient } from "@lib/http/http-client";

import { locationHttpAdapter } from "./location.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe("locationHttpAdapter", () => {
  it("lists countries", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [{ country_id: 1, iso2_code: "MX", name: "Mexico" }],
    });

    await expect(locationHttpAdapter.listCountries()).resolves.toEqual([
      { countryId: 1, iso2Code: "MX", name: "Mexico" },
    ]);
  });

  it("trims the search value for states", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ data: [] });

    await locationHttpAdapter.listStates(9, "  norte  ");

    expect(httpClient.get).toHaveBeenCalledWith(
      "/api/v1/locations/states?country_id=9&search=norte",
    );
  });

  it("throws on invalid city pagination input", async () => {
    await expect(locationHttpAdapter.listCities(1, undefined, 0, 10)).rejects.toThrow(
      "page must be a positive integer.",
    );
  });
});
