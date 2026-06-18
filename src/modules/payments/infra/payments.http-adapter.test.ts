import { httpClient } from "@lib/http/http-client";
import { paymentsHttpAdapter } from "./payments.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("paymentsHttpAdapter", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("fetches payments list without filters", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [],
        meta: { total: 0, shown: 0 },
      });

      const result = await paymentsHttpAdapter.list();

      expect(httpClient.get).toHaveBeenCalledWith("/api/v1/payments");
      expect(result).toEqual({
        data: [],
        meta: { total: 0, shown: 0 },
      });
    });

    it("fetches payments list with filters", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [],
        meta: { total: 0, shown: 0 },
      });

      await paymentsHttpAdapter.list({
        propertyId: 5,
        statusId: 2,
        dateFrom: "2024-03-01",
        dateTo: "2024-03-10",
        limit: 10,
        offset: 0,
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        "/api/v1/payments?property_id=5&status_id=2&date_from=2024-03-01&date_to=2024-03-10&limit=10&offset=0",
      );
    });

    it("caps the requested limit at the api maximum", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        data: [],
        meta: { total: 0, shown: 0 },
      });

      await paymentsHttpAdapter.list({
        limit: 250,
        offset: 0,
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        "/api/v1/payments?limit=100&offset=0",
      );
    });
  });

  describe("getById", () => {
    it("fetches a payment detail by UUID", async () => {
      const mockDto = {
        payment_uuid: "pay-123",
        contract_id: 10,
        property_id: 5,
        billing_period: "2024-03-01",
        due_date: "2024-03-10",
        amount: "1500.00",
        currency: "MXN",
        payment_method: "Tarjeta",
        gateway: "MercadoPago",
        status: "pending",
        payment_date: null,
        transaction_id: 3,
        transaction_type: "rent",
        agreed_amount: "15000.00",
        client_id: 7,
        agent_id: 2,
      };

      vi.mocked(httpClient.get).mockResolvedValue(mockDto);

      const result = await paymentsHttpAdapter.getById("pay-123");

      expect(httpClient.get).toHaveBeenCalledWith("/api/v1/payments/pay-123");
      expect(result.paymentUuid).toBe("pay-123");
      expect(result.amount).toBe(1500);
      expect(result.agreedAmount).toBe(15000);
    });
  });

  describe("process", () => {
    it("posts a payment registration to the API", async () => {
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

      const mockResponseDto = {
        payment_uuid: "pay-789",
        status: "completed",
        status_id: 2,
        amount: 150000,
        payment_date: "2024-03-08T14:32:00Z",
        gateway_payment_id: "gp-987",
        reference_number: "REF-456",
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponseDto);

      const result = await paymentsHttpAdapter.process(mockInput);

      expect(httpClient.post).toHaveBeenCalledWith("/api/v1/payments", {
        contract_id: 12,
        payment_method_id: 1,
        gateway_id: 2,
        amount: 150000,
        currency: "MXN",
        token: "tok_abc123",
        gateway_method_id: "card",
        issuer_id: "123",
        installments: 1,
        payer_email: "tenant@example.com",
      });

      expect(result.paymentUuid).toBe("pay-789");
      expect(result.status).toBe("completed");
      expect(result.statusId).toBe(2);
      expect(result.amount).toBe(150000);
    });
  });
});
