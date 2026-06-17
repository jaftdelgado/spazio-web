import { httpClient } from "@lib/http/http-client";

import { clauseHttpAdapter } from "./clause.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe("clauseHttpAdapter", () => {
  it("builds query params for clause filters", async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      data: [
        {
          clause_id: 9,
          code: "NO_SMOKING",
          value_type: { code: "BOOLEAN" },
          sort_order: 1,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
        query: "smoke",
      },
    });

    await clauseHttpAdapter.listClauses({
      modalityId: 3,
      q: "smoke",
      page: 2,
      pageSize: 20,
    });

    expect(httpClient.get).toHaveBeenCalledWith(
      "/api/v1/clauses?modality_id=3&q=smoke&page=2&page_size=20",
    );
  });
});
