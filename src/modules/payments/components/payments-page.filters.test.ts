"use client";

import {
  buildPaymentPropertyOptions,
  buildPaymentStatusOptions,
  filterPaymentRows,
  normalizePaymentStatus,
  paginatePaymentRows,
  type PaymentFilterFormState,
} from "./payments-page.filters";

describe("payments-page.filters", () => {
  it("normalizes equivalent payment statuses", () => {
    expect(normalizePaymentStatus("Pending")).toBe("pending");
    expect(normalizePaymentStatus("pendiente")).toBe("pending");
    expect(normalizePaymentStatus("Approved")).toBe("approved");
    expect(normalizePaymentStatus("Pagado")).toBe("completed");
  });

  it("builds property options from properties, payments, and contracts without duplicates", () => {
    const options = buildPaymentPropertyOptions({
      properties: [
        {
          propertyId: 7,
          title: "Loft Centro",
        } as never,
      ],
      rows: [
        {
          paymentUuid: "pay-1",
          propertyId: 7,
          propertyTitle: "Loft Centro",
          dueDate: "2026-06-18",
          status: "Pending",
        },
        {
          paymentUuid: "pay-2",
          propertyId: 0,
          propertyTitle: "Casa Norte",
          dueDate: "2026-06-21",
          status: "Pending",
          isSimulated: true,
        },
      ],
      contracts: [
        {
          contractUuid: "contract-1",
          propertyTitle: "Casa Norte",
        } as never,
      ],
    });

    expect(options).toEqual([
      { value: "title:casa norte", label: "Casa Norte" },
      { value: "property:7", label: "Loft Centro", propertyId: 7 },
    ]);
  });

  it("deduplicates the same property label across real and simulated rows", () => {
    const options = buildPaymentPropertyOptions({
      properties: [
        {
          propertyId: 11,
          title: "Residencia acogedora en Xalapa, México",
        } as never,
      ],
      rows: [
        {
          paymentUuid: "pay-real",
          propertyId: 11,
          propertyTitle: "Residencia acogedora en Xalapa, México",
          dueDate: "2026-06-18",
          status: "Pending",
        },
        {
          paymentUuid: "pay-simulated",
          propertyId: 0,
          propertyTitle: "Residencia acogedora en Xalapa, México",
          dueDate: "2026-07-18",
          status: "Pending",
          isSimulated: true,
        },
      ],
      contracts: [
        {
          contractUuid: "contract-1",
          propertyTitle: "Residencia acogedora en Xalapa, México",
        } as never,
      ],
    });

    expect(options).toEqual([
      {
        value: "property:11",
        label: "Residencia acogedora en Xalapa, México",
        propertyId: 11,
      },
    ]);
  });

  it("filters rows by property, normalized status, and inclusive due date range", () => {
    const filters: PaymentFilterFormState = {
      propertyValue: "property:7",
      statusValue: "pending",
      dateFrom: "2026-06-10",
      dateTo: "2026-06-20",
    };

    const filtered = filterPaymentRows({
      rows: [
        {
          paymentUuid: "pay-1",
          propertyId: 7,
          propertyTitle: "Loft Centro",
          dueDate: "2026-06-18T00:00:00.000Z",
          status: "Pendiente",
        },
        {
          paymentUuid: "pay-2",
          propertyId: 7,
          propertyTitle: "Loft Centro",
          dueDate: "2026-06-25T00:00:00.000Z",
          status: "Pendiente",
        },
        {
          paymentUuid: "pay-3",
          propertyId: 9,
          propertyTitle: "Casa Sur",
          dueDate: "2026-06-18T00:00:00.000Z",
          status: "Pendiente",
        },
      ],
      filters,
      selectedProperty: {
        value: "property:7",
        label: "Loft Centro",
        propertyId: 7,
      },
    });

    expect(filtered.map((row) => row.paymentUuid)).toEqual(["pay-1"]);
  });

  it("keeps ISO timestamps aligned to their calendar date when filtering", () => {
    const filtered = filterPaymentRows({
      rows: [
        {
          paymentUuid: "pay-utc",
          propertyId: 7,
          propertyTitle: "Loft Centro",
          dueDate: "2026-06-18T00:00:00.000Z",
          status: "Pendiente",
        },
      ],
      filters: {
        propertyValue: "",
        statusValue: "",
        dateFrom: "2026-06-18",
        dateTo: "2026-06-18",
      },
    });

    expect(filtered.map((row) => row.paymentUuid)).toEqual(["pay-utc"]);
  });

  it("builds normalized status options and paginates the filtered result", () => {
    const options = buildPaymentStatusOptions([
      {
        paymentUuid: "pay-1",
        propertyId: 7,
        dueDate: "2026-06-18",
        status: "Pendiente",
      },
      {
        paymentUuid: "pay-2",
        propertyId: 8,
        dueDate: "2026-06-19",
        status: "Completed",
      },
      {
        paymentUuid: "pay-3",
        propertyId: 8,
        dueDate: "2026-06-19",
        status: "pending",
      },
    ]);

    expect(options).toEqual([
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pendiente" },
    ]);

    expect(paginatePaymentRows([1, 2, 3, 4, 5], 2, 2)).toEqual([3, 4]);
  });
});
