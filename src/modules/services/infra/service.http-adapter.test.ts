import { httpClient } from "@lib/http/http-client";

import { serviceHttpAdapter } from "./service.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe("serviceHttpAdapter", () => {
  it("calls the base endpoint when no params are provided", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, page_size: 10, total_pages: 0, query: null },
    });

    await serviceHttpAdapter.listServices();

    expect(httpClient.get).toHaveBeenCalledWith("/api/v1/services");
  });

  it("serializes service filters into the query string", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, page_size: 10, total_pages: 0, query: null },
    });

    await serviceHttpAdapter.listServices({
      q: "wifi",
      categoryId: 4,
      page: 3,
      pageSize: 15,
    });

    expect(httpClient.get).toHaveBeenCalledWith(
      "/api/v1/services?q=wifi&category_id=4&page=3&page_size=15",
    );
  });
});
