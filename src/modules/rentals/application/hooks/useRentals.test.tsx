import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { rentalsHttpAdapter } from "../../infra/rentals.http-adapter";
import { useConfirmRental, useRentalPreview } from "./useRentals";

vi.mock("../../infra/rentals.http-adapter", () => ({
  rentalsHttpAdapter: {
    preview: vi.fn(),
    confirm: vi.fn(),
  },
}));

describe("useRentals hooks", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads rental preview when enabled", async () => {
    const previewInput = {
      propertyUuid: "prop-123",
      periodId: 3,
      startDate: "2026-07-01",
      endDate: "2026-08-01",
    };
    const previewResponse = {
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
      priceComponents: [],
    };

    vi.mocked(rentalsHttpAdapter.preview).mockResolvedValue(previewResponse);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useRentalPreview(previewInput), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(previewResponse);
    });
    expect(rentalsHttpAdapter.preview).toHaveBeenCalledWith(previewInput);
  });

  it("does not load rental preview when disabled", () => {
    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(
      () =>
        useRentalPreview(
          {
            propertyUuid: "prop-123",
            periodId: 3,
            startDate: "2026-07-01",
            endDate: "2026-08-01",
          },
          false,
        ),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(rentalsHttpAdapter.preview).not.toHaveBeenCalled();
  });

  it("confirms a rental and invalidates related queries", async () => {
    const confirmInput = {
      propertyUuid: "prop-123",
      clientUuid: "client-789",
      periodId: 3,
      startDate: "2026-07-01",
      endDate: "2026-08-01",
    };
    const confirmationResponse = {
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
    };

    vi.mocked(rentalsHttpAdapter.confirm).mockResolvedValue(confirmationResponse);

    const { queryClient, Wrapper } = createQueryClientWrapper();
    const invalidateQueries = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useConfirmRental(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync(confirmInput);

    expect(rentalsHttpAdapter.confirm).toHaveBeenCalledWith(confirmInput);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["rentals", "preview"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["properties", "detail", "prop-123"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["properties", "prices", "prop-123"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["properties", "list"],
    });
  });
});
