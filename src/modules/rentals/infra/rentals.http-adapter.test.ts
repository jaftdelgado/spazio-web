import { httpClient } from "@lib/http/http-client";

import { rentalsHttpAdapter } from "./rentals.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe("rentalsHttpAdapter", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("requests a rental preview and maps the response", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      property_uuid: "prop-123",
      period: "Monthly",
      period_id: 3,
      start_date: "2026-07-01",
      end_date: "2026-08-01",
      units: 1,
      unit_price: "15000.00",
      currency: "MXN",
      subtotal: "15000.00",
      deposit: "15000.00",
      total: "30000.00",
      is_negotiable: false,
      blocked_dates: [],
      breakdown: {
        years: 0,
        months: 1,
        weeks: 0,
        nights: 0,
      },
      price_components: [
        {
          period_id: 3,
          period: "Monthly",
          units: 1,
          unit_price: "15000.00",
          line_total: "15000.00",
        },
      ],
    });

    const result = await rentalsHttpAdapter.preview({
      propertyUuid: "prop-123",
      periodId: 3,
      startDate: "2026-07-01",
      endDate: "2026-08-01",
    });

    expect(httpClient.post).toHaveBeenCalledWith("/api/v1/rentals/preview", {
      property_uuid: "prop-123",
      period_id: 3,
      start_date: "2026-07-01",
      end_date: "2026-08-01",
    });
    expect(result).toEqual({
      propertyUuid: "prop-123",
      period: "Monthly",
      periodId: 3,
      startDate: "2026-07-01",
      endDate: "2026-08-01",
      units: 1,
      unitPrice: "15000.00",
      currency: "MXN",
      subtotal: "15000.00",
      deposit: "15000.00",
      total: "30000.00",
      isNegotiable: false,
      blockedDates: [],
      breakdown: {
        years: 0,
        months: 1,
        weeks: 0,
        nights: 0,
      },
      priceComponents: [
        {
          periodId: 3,
          period: "Monthly",
          units: 1,
          unitPrice: "15000.00",
          lineTotal: "15000.00",
        },
      ],
    });
  });

  it("confirms a rental and maps the response", async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      transaction_uuid: "txn-123",
      contract_uuid: "ctr-456",
      property_uuid: "prop-123",
      status: "confirmed",
      period: "Monthly",
      period_id: 3,
      start_date: "2026-07-01",
      end_date: "2026-08-01",
      currency: "MXN",
      subtotal: "15000.00",
      deposit: "15000.00",
      total: "30000.00",
      is_negotiable: false,
      breakdown: {
        years: 0,
        months: 1,
        weeks: 0,
        nights: 0,
      },
      price_components: [],
    });

    const result = await rentalsHttpAdapter.confirm({
      propertyUuid: "prop-123",
      clientUuid: "client-789",
      periodId: 3,
      startDate: "2026-07-01",
      endDate: "2026-08-01",
    });

    expect(httpClient.post).toHaveBeenCalledWith("/api/v1/rentals", {
      property_uuid: "prop-123",
      client_uuid: "client-789",
      period_id: 3,
      start_date: "2026-07-01",
      end_date: "2026-08-01",
    });
    expect(result).toEqual({
      transactionUuid: "txn-123",
      contractUuid: "ctr-456",
      propertyUuid: "prop-123",
      status: "confirmed",
      period: "Monthly",
      periodId: 3,
      startDate: "2026-07-01",
      endDate: "2026-08-01",
      currency: "MXN",
      subtotal: "15000.00",
      deposit: "15000.00",
      total: "30000.00",
      isNegotiable: false,
      breakdown: {
        years: 0,
        months: 1,
        weeks: 0,
        nights: 0,
      },
      priceComponents: [],
    });
  });
});
