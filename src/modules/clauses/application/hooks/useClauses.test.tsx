import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { clauseHttpAdapter } from "@clauses/infra/clause.http-adapter";

import { useClauses } from "./useClauses";

vi.mock("@clauses/infra/clause.http-adapter", () => ({
  clauseHttpAdapter: {
    listClauses: vi.fn(),
  },
}));

describe("useClauses", () => {
  it("does not fetch without a modality id", () => {
    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(
      () => useClauses({ modalityId: null, q: "wifi" }),
      { wrapper: Wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(clauseHttpAdapter.listClauses).not.toHaveBeenCalled();
  });

  it("fetches clauses when the modality id is present", async () => {
    vi.mocked(clauseHttpAdapter.listClauses).mockResolvedValue({
      data: [
        {
          clauseId: 1,
          code: "NO_PETS",
          valueType: { code: "boolean" },
          sortOrder: 1,
        },
      ],
      meta: {
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
        query: null,
      },
    });

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useClauses({ modalityId: 2 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data?.data).toHaveLength(1);
    });
  });
});
