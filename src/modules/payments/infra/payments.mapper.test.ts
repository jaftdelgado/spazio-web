import {
  mapPaymentListItem,
  mapPaymentDetail,
  mapPaymentListMeta,
  mapPaymentListResponse,
  mapRegisterPaymentInputToDto,
  mapPaymentResponse,
} from "./payments.mapper";

describe("payments.mapper", () => {
  it("maps a payment list item correctly", () => {
    const rawItem = {
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
    };

    const expected = {
      paymentUuid: "pay-123",
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
    };

    expect(mapPaymentListItem(rawItem)).toEqual(expected);
  });

  it("maps a payment detail correctly", () => {
    const rawDetail = {
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

    const expected = {
      paymentUuid: "pay-123",
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
      clientId: 7,
      agentId: 2,
    };

    expect(mapPaymentDetail(rawDetail)).toEqual(expected);
  });

  it("maps a payment list meta correctly", () => {
    const rawMeta = {
      total: 50,
      shown: 10,
    };

    const expected = {
      total: 50,
      shown: 10,
    };

    expect(mapPaymentListMeta(rawMeta)).toEqual(expected);
  });

  it("maps a payment list response correctly", () => {
    const rawResponse = {
      data: [
        {
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
        },
      ],
      meta: {
        total: 1,
        shown: 1,
      },
    };

    const expected = {
      data: [
        {
          paymentUuid: "pay-123",
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
      meta: {
        total: 1,
        shown: 1,
      },
    };

    expect(mapPaymentListResponse(rawResponse)).toEqual(expected);
  });

  it("maps a RegisterPaymentInput to RegisterPaymentRequestDto correctly", () => {
    const input = {
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

    const expected = {
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
    };

    expect(mapRegisterPaymentInputToDto(input)).toEqual(expected);
  });

  it("maps a PaymentResponseDto to PaymentResponse correctly", () => {
    const rawResponse = {
      payment_uuid: "pay-789",
      status: "completed",
      status_id: 2,
      amount: 150000,
      payment_date: "2024-03-08T14:32:00Z",
      gateway_payment_id: "gp-987",
      reference_number: "REF-456",
    };

    const expected = {
      paymentUuid: "pay-789",
      status: "completed",
      statusId: 2,
      amount: 150000,
      paymentDate: "2024-03-08T14:32:00Z",
      gatewayPaymentId: "gp-987",
      referenceNumber: "REF-456",
    };

    expect(mapPaymentResponse(rawResponse)).toEqual(expected);
  });
});
