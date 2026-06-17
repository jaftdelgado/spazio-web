import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { serviceHttpAdapter } from "@services/infra/service.http-adapter";

import { useInfiniteServices, useServices } from "./useServices";

vi.mock("@services/infra/service.http-adapter", () => ({
  serviceHttpAdapter: {
    listServices: vi.fn(),
  },
}));

describe("useServices hooks", () => {
  it("loads a service page", async () => {
    vi.mocked(serviceHttpAdapter.listServices).mockResolvedValue({
      data: [
        {
          serviceId: 1,
          code: "WIFI",
          icon: "Wifi02Icon",
          categoryCode: "technology",
        },
      ],
      meta: { total: 1, page: 1, pageSize: 10, totalPages: 1, query: null },
    });

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useServices({ q: "wifi" }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.data[0].code).toBe("WIFI");
    });
  });

  it("detects the next infinite services page", async () => {
    vi.mocked(serviceHttpAdapter.listServices).mockResolvedValue({
      data: [],
      meta: { total: 2, page: 1, pageSize: 1, totalPages: 2, query: null },
    });

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useInfiniteServices("wifi", 1, 4), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });
  });
});
