import { renderHook, waitFor } from "@testing-library/react";

import { createQueryClientWrapper } from "@/test/query-client-test-wrapper";
import { contractsHttpAdapter } from "../../infra/contracts.http-adapter";

import { useContractDetail, useContractsList } from "./useContracts";

vi.mock("../../infra/contracts.http-adapter", () => ({
  contractsHttpAdapter: {
    list: vi.fn(),
    getById: vi.fn(),
  },
}));

describe("useContracts hooks", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads contracts list", async () => {
    const mockContracts = [
      {
        contractUuid: "bec14a91-902a-444f-ac0d-d65c6d750454",
        transactionType: "rent",
        propertyTitle: "Residencia acogedora en Xalapa",
        agreedAmount: 2600,
        currency: "MXN",
        startDate: "2026-06-18T00:00:00Z",
        status: "Status.Draft",
        clientName: "Cliente Renta",
        createdAt: "2026-06-17T00:00:00Z",
      },
    ];

    vi.mocked(contractsHttpAdapter.list).mockResolvedValue(mockContracts);

    const { Wrapper } = createQueryClientWrapper();

    const { result } = renderHook(
      () =>
        useContractsList({
          page: 1,
          limit: 10,
          transactionType: "rent",
        }),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockContracts);
    });

    expect(contractsHttpAdapter.list).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      transactionType: "rent",
    });
  });

  it("does not load contracts list when disabled", () => {
    const { Wrapper } = createQueryClientWrapper();

    const { result } = renderHook(
      () =>
        useContractsList(
          {
            page: 1,
            limit: 10,
          },
          false,
        ),
      { wrapper: Wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(contractsHttpAdapter.list).not.toHaveBeenCalled();
  });

  it("loads contract detail by UUID", async () => {
    const mockContractDetail = {
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
    };

    vi.mocked(contractsHttpAdapter.getById).mockResolvedValue(
      mockContractDetail,
    );

    const { Wrapper } = createQueryClientWrapper();

    const { result } = renderHook(
      () => useContractDetail("bec14a91-902a-444f-ac0d-d65c6d750454"),
      { wrapper: Wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockContractDetail);
    });

    expect(contractsHttpAdapter.getById).toHaveBeenCalledWith(
      "bec14a91-902a-444f-ac0d-d65c6d750454",
    );
  });

  it("does not load contract detail when UUID is empty", () => {
    const { Wrapper } = createQueryClientWrapper();

    const { result } = renderHook(() => useContractDetail(""), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(contractsHttpAdapter.getById).not.toHaveBeenCalled();
  });

  it("does not load contract detail when disabled", () => {
    const { Wrapper } = createQueryClientWrapper();

    const { result } = renderHook(
      () => useContractDetail("bec14a91-902a-444f-ac0d-d65c6d750454", false),
      { wrapper: Wrapper },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(contractsHttpAdapter.getById).not.toHaveBeenCalled();
  });
});