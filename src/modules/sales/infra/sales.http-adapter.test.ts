import { httpClient } from "@lib/http/http-client";

import { salesHttpAdapter } from "./sales.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe("salesHttpAdapter", () => {
  it("formalizes a sale using the existing http client pattern", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      transaction_uuid: "txn-123",
      contract_uuid: "ctr-456",
      property_uuid: "prop-789",
      status: "formalized",
      final_amount: 1500000,
      currency: "MXN",
    });

    const result = await salesHttpAdapter.formalize({
      propertyUuid: "prop-789",
      agreedAmount: 1500000,
    });

    expect(httpClient.post).toHaveBeenCalledWith("/api/v1/sales", {
      property_uuid: "prop-789",
      agreed_amount: 1500000,
    });
    expect(result).toEqual({
      transactionUuid: "txn-123",
      contractUuid: "ctr-456",
      propertyUuid: "prop-789",
      status: "formalized",
      finalAmount: 1500000,
      currency: "MXN",
    });
  });
});
