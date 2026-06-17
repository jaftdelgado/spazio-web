import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { locationHttpAdapter } from "@locations/infra/location.http-adapter";

import {
  useCities,
  useCountries,
  useInfiniteCities,
  useStates,
} from "./useLocations";

vi.mock("@locations/infra/location.http-adapter", () => ({
  locationHttpAdapter: {
    listCountries: vi.fn(),
    listStates: vi.fn(),
    listCities: vi.fn(),
  },
}));

describe("useLocations hooks", () => {
  it("loads countries", async () => {
    vi.mocked(locationHttpAdapter.listCountries).mockResolvedValue([
      { countryId: 1, iso2Code: "MX", name: "Mexico" },
    ]);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useCountries(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.data?.[0].name).toBe("Mexico");
    });
  });

  it("disables state and city queries for invalid ids", () => {
    const { Wrapper } = createQueryClientWrapper();
    const statesHook = renderHook(() => useStates(0, "roma"), { wrapper: Wrapper });
    const citiesHook = renderHook(() => useCities(0, "roma"), { wrapper: Wrapper });

    expect(statesHook.result.current.fetchStatus).toBe("idle");
    expect(citiesHook.result.current.fetchStatus).toBe("idle");
  });

  it("computes the next page for infinite cities", async () => {
    vi.mocked(locationHttpAdapter.listCities).mockResolvedValue({
      data: [{ cityId: 1, name: "Roma Norte" }],
      meta: { total: 2, page: 1, pageSize: 1, totalPages: 2 },
    });

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useInfiniteCities(4, "roma", 1), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });
  });
});
