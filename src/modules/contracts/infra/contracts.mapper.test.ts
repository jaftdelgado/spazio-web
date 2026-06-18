import {
  mapContract,
  mapContractList,
  mapContractListItem,
} from "./contracts.mapper";

describe("contracts.mapper", () => {
  it("maps contract detail DTOs", () => {
    expect(
      mapContract({
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
      }),
    ).toEqual({
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

  it("maps sale contract details without optional period or end date", () => {
    expect(
      mapContract({
        contract_id: 11,
        contract_uuid: "aa55a695-e953-4604-9dbc-1297128b9187",
        property_title: "Departamento moderno",
        owner_name: "Admin Spazio",
        client_name: "Cliente Venta",
        agreed_amount: 975000,
        currency: "MXN",
        start_date: "2026-06-18T00:00:00Z",
        end_date: null,
        status: "Status.Draft",
        pdf_url: "https://storage.test/contracts/sale.pdf",
      }),
    ).toEqual({
      contractId: 11,
      contractUuid: "aa55a695-e953-4604-9dbc-1297128b9187",
      propertyTitle: "Departamento moderno",
      ownerName: "Admin Spazio",
      clientName: "Cliente Venta",
      agreedAmount: 975000,
      currency: "MXN",
      periodName: undefined,
      startDate: "2026-06-18T00:00:00Z",
      endDate: null,
      status: "Status.Draft",
      pdfUrl: "https://storage.test/contracts/sale.pdf",
    });
  });

  it("maps contract list items", () => {
    expect(
      mapContractListItem({
        contract_uuid: "ae2e3a48-d96c-4729-931f-8051c382a56c",
        transaction_type: "rent",
        property_title: "Casa en Xalapa",
        agreed_amount: 8000,
        currency: "MXN",
        start_date: "2026-06-18T00:00:00Z",
        status: "Status.Draft",
        client_name: "Cliente Renta",
        created_at: "2026-06-17T00:00:00Z",
      }),
    ).toEqual({
      contractUuid: "ae2e3a48-d96c-4729-931f-8051c382a56c",
      transactionType: "rent",
      propertyTitle: "Casa en Xalapa",
      agreedAmount: 8000,
      currency: "MXN",
      startDate: "2026-06-18T00:00:00Z",
      status: "Status.Draft",
      clientName: "Cliente Renta",
      createdAt: "2026-06-17T00:00:00Z",
    });
  });

  it("maps contract lists and returns an empty array for invalid payloads", () => {
    expect(
      mapContractList([
        {
          contract_uuid: "42b16c12-ad9d-4c59-ba54-01acfc4103ee",
          transaction_type: "sale",
          property_title: "Depa Nuevo Moderno",
          agreed_amount: 975000,
          currency: "MXN",
          start_date: "2026-06-18T00:00:00Z",
          status: "Status.Draft",
          client_name: "Cliente Compra",
          created_at: "2026-06-17T00:00:00Z",
        },
      ]),
    ).toHaveLength(1);

    expect(mapContractList(null as never)).toEqual([]);
  });
});