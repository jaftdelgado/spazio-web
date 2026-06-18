import { httpClient } from "@lib/http/http-client";

import { contractsHttpAdapter } from "./contracts.http-adapter";

vi.mock("@lib/http/http-client", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

describe("contractsHttpAdapter", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getById", () => {
    it("fetches and maps a contract detail by UUID", async () => {
      vi.mocked(httpClient.get).mockResolvedValue({
        contract_id: 10,
        contract_uuid: "bec14a91-902a-444f-ac0d-d65c6d750454",
        property_title: "Residencia acogedora en Xalapa",
        owner_name: "Admin Spazio",
        client_name: "Cliente Prueba",
        agreed_amount: 2600,
        currency: "MXN",
        period_name: "Monthly",
        start_date: "2026-06-18T00:00:00Z",
        end_date: "2026-07-18T00:00:00Z",
        status: "Status.Draft",
        pdf_url: "https://storage.test/contracts/rent.pdf",
      });

      const result = await contractsHttpAdapter.getById(
        "bec14a91-902a-444f-ac0d-d65c6d750454",
      );

      expect(httpClient.get).toHaveBeenCalledWith(
        "/api/v1/contracts/bec14a91-902a-444f-ac0d-d65c6d750454",
      );

      expect(result).toEqual({
        contractId: 10,
        contractUuid: "bec14a91-902a-444f-ac0d-d65c6d750454",
        propertyTitle: "Residencia acogedora en Xalapa",
        ownerName: "Admin Spazio",
        clientName: "Cliente Prueba",
        agreedAmount: 2600,
        currency: "MXN",
        periodName: "Monthly",
        startDate: "2026-06-18T00:00:00Z",
        endDate: "2026-07-18T00:00:00Z",
        status: "Status.Draft",
        pdfUrl: "https://storage.test/contracts/rent.pdf",
      });
    });
  });

  describe("list", () => {
    it("fetches and maps contracts without filters", async () => {
      vi.mocked(httpClient.get).mockResolvedValue([
        {
          contract_uuid: "aa55a695-e953-4604-9dbc-1297128b9187",
          transaction_type: "rent",
          property_title: "Casa en Xalapa",
          agreed_amount: 8000,
          currency: "MXN",
          start_date: "2026-06-18T00:00:00Z",
          status: "Status.Draft",
          client_name: "Cliente Renta",
          created_at: "2026-06-17T00:00:00Z",
        },
      ]);

      const result = await contractsHttpAdapter.list();

      expect(httpClient.get).toHaveBeenCalledWith("/api/v1/contracts");

      expect(result).toEqual([
        {
          contractUuid: "aa55a695-e953-4604-9dbc-1297128b9187",
          transactionType: "rent",
          propertyTitle: "Casa en Xalapa",
          agreedAmount: 8000,
          currency: "MXN",
          startDate: "2026-06-18T00:00:00Z",
          status: "Status.Draft",
          clientName: "Cliente Renta",
          createdAt: "2026-06-17T00:00:00Z",
        },
      ]);
    });

    it("builds query params with all supported filters", async () => {
      vi.mocked(httpClient.get).mockResolvedValue([]);

      const result = await contractsHttpAdapter.list({
        page: 2,
        limit: 15,
        transactionType: "sale",
        statusId: 1,
        search: "Residencia Xalapa",
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        "/api/v1/contracts?page=2&limit=15&transaction_type=sale&status_id=1&search=Residencia+Xalapa",
      );
      expect(result).toEqual([]);
    });

    it("skips undefined filters when building query params", async () => {
      vi.mocked(httpClient.get).mockResolvedValue([]);

      await contractsHttpAdapter.list({
        page: 1,
        limit: 10,
        transactionType: undefined,
        statusId: undefined,
        search: "",
      });

      expect(httpClient.get).toHaveBeenCalledWith(
        "/api/v1/contracts?page=1&limit=10",
      );
    });
  });
});