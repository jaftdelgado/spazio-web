import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { catalogHttpAdapter } from "@catalogs/infra/catalog.http-adapter";

import {
  useModalities,
  useOrientations,
  usePropertyTypes,
  useRentPeriods,
} from "./useCatalogs";

vi.mock("@catalogs/infra/catalog.http-adapter", () => ({
  catalogHttpAdapter: {
    listModalities: vi.fn(),
    listPropertyTypes: vi.fn(),
    listRentPeriods: vi.fn(),
    listOrientations: vi.fn(),
  },
}));

describe("useCatalogs hooks", () => {
  it("loads modalities", async () => {
    vi.mocked(catalogHttpAdapter.listModalities).mockResolvedValue([
      { modalityId: 1, name: "Sale" },
    ]);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useModalities(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ modalityId: 1, name: "Sale" }]);
    });
  });

  it("loads property types and orientations", async () => {
    vi.mocked(catalogHttpAdapter.listPropertyTypes).mockResolvedValue([
      {
        propertyTypeId: 3,
        name: "Apartment",
        icon: null,
        subtype: "residential",
      },
    ]);
    vi.mocked(catalogHttpAdapter.listOrientations).mockResolvedValue([
      { orientationId: 2, name: "North" },
    ]);

    const { Wrapper } = createQueryClientWrapper();
    const propertyTypesHook = renderHook(() => usePropertyTypes(), {
      wrapper: Wrapper,
    });
    const orientationsHook = renderHook(() => useOrientations(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(propertyTypesHook.result.current.data?.[0].name).toBe("Apartment");
      expect(orientationsHook.result.current.data?.[0].name).toBe("North");
    });
  });

  it("disables rent periods when the property type id is invalid", () => {
    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useRentPeriods(0), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(catalogHttpAdapter.listRentPeriods).not.toHaveBeenCalled();
  });

  it("loads rent periods when enabled", async () => {
    vi.mocked(catalogHttpAdapter.listRentPeriods).mockResolvedValue([
      { periodId: 5, name: "Weekly" },
    ]);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useRentPeriods(8), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ periodId: 5, name: "Weekly" }]);
    });
  });
});
