import { renderHook } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { salesHttpAdapter } from "../../infra/sales.http-adapter";
import { useFormalizeSale } from "./useSales";

vi.mock("../../infra/sales.http-adapter", () => ({
  salesHttpAdapter: {
    formalize: vi.fn(),
  },
}));

describe("useSales hooks", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("formalizes a sale and invalidates related queries", async () => {
    const formalizeInput = {
      propertyUuid: "prop-789",
      agreedAmount: 1500000,
    };
    const formalizationResponse = {
      transactionUuid: "txn-123",
      contractUuid: "ctr-456",
      propertyUuid: "prop-789",
      status: "formalized",
      finalAmount: 1500000,
      currency: "MXN",
    };

    vi.mocked(salesHttpAdapter.formalize).mockResolvedValue(
      formalizationResponse,
    );

    const { queryClient, Wrapper } = createQueryClientWrapper();
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useFormalizeSale(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync(formalizeInput);

    expect(salesHttpAdapter.formalize).toHaveBeenCalledWith(formalizeInput);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["properties", "detail", "prop-789"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["properties", "prices", "prop-789"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["properties", "history", "prop-789"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["properties", "list"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["contracts"],
    });
  });
});
