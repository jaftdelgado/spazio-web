import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { paymentsHttpAdapter } from "../../infra/payments.http-adapter";
import { usePaymentsList, usePaymentDetail, useProcessPayment } from "./usePayments";

vi.mock("../../infra/payments.http-adapter", () => ({
  paymentsHttpAdapter: {
    list: vi.fn(),
    getById: vi.fn(),
    process: vi.fn(),
  },
}));

describe("usePayments hooks", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads payments list", async () => {
    const mockPayments = {
      data: [
        {
          paymentUuid: "pay-1",
          contractId: 10,
          propertyId: 5,
          billingPeriod: "2024-03-01",
          dueDate: "2024-03-10",
          amount: 1500,
          currency: "MXN",
          paymentMethod: "Tarjeta",
          gateway: "MercadoPago",
          status: "pending",
          paymentDate: null,
        },
      ],
      meta: { total: 1, shown: 1 },
    };
    vi.mocked(paymentsHttpAdapter.list).mockResolvedValue(mockPayments);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => usePaymentsList({ propertyId: 5 }), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockPayments);
    });
    expect(paymentsHttpAdapter.list).toHaveBeenCalledWith({ propertyId: 5 });
  });

  it("loads payment detail", async () => {
    const mockDetail = {
      paymentUuid: "pay-1",
      contractId: 10,
      propertyId: 5,
      billingPeriod: "2024-03-01",
      dueDate: "2024-03-10",
      amount: 1500,
      currency: "MXN",
      paymentMethod: "Tarjeta",
      gateway: "MercadoPago",
      status: "pending",
      paymentDate: null,
      transactionId: 3,
      transactionType: "rent",
      agreedAmount: 15000,
    };
    vi.mocked(paymentsHttpAdapter.getById).mockResolvedValue(mockDetail);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => usePaymentDetail("pay-1"), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockDetail);
    });
    expect(paymentsHttpAdapter.getById).toHaveBeenCalledWith("pay-1");
  });

  it("disables usePaymentDetail when uuid is empty", () => {
    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => usePaymentDetail(""), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(paymentsHttpAdapter.getById).not.toHaveBeenCalled();
  });

  it("processes payment through mutation", async () => {
    const mockInput = {
      contractId: 12,
      paymentMethodId: 1,
      gatewayId: 2,
      amount: 150000,
      currency: "MXN",
      token: "tok_abc123",
      gatewayMethodId: "card",
      issuerId: "123",
      installments: 1,
      payerEmail: "tenant@example.com",
    };

    const mockResponse = {
      paymentUuid: "pay-789",
      status: "completed",
      statusId: 2,
      amount: 150000,
      paymentDate: "2024-03-08T14:32:00Z",
      gatewayPaymentId: "gp-987",
      referenceNumber: "REF-456",
    };

    vi.mocked(paymentsHttpAdapter.process).mockResolvedValue(mockResponse);

    const { Wrapper } = createQueryClientWrapper();
    const { result } = renderHook(() => useProcessPayment(), { wrapper: Wrapper });

    await result.current.mutateAsync(mockInput);

    expect(paymentsHttpAdapter.process).toHaveBeenCalledWith(mockInput);
  });
});
