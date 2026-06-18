import type { PaymentListItem } from "../domain/payments.entity";
import {
  buildPropertyOptions,
  filterPaymentsRows,
  getStableCalendarDate,
  normalizePaymentStatus,
  paginateFilteredPayments,
} from "./payments-page.filters";

type TestPaymentRow = PaymentListItem & {
  propertyTitle?: string;
  isSimulated?: boolean;
};

function createRow(overrides: Partial<TestPaymentRow> = {}): TestPaymentRow {
  return {
    paymentUuid: "pay-1",
    contractId: 10,
    propertyId: 5,
    propertyTitle: "Casa Roma",
    billingPeriod: "2024-03-01",
    dueDate: "2024-03-10",
    amount: 15000,
    currency: "MXN",
    paymentMethod: "Card",
    gateway: "Stripe",
    status: "Pending",
    paymentDate: null,
    ...overrides,
  };
}

describe("payments-page.filters", () => {
  it("normalizes payment statuses across language variants", () => {
    expect(normalizePaymentStatus("Pending")).toBe("pending");
    expect(normalizePaymentStatus("pendiente")).toBe("pending");
    expect(normalizePaymentStatus("Approved")).toBe("approved");
    expect(normalizePaymentStatus("completado")).toBe("completed");
    expect(normalizePaymentStatus("cancelled_by_new_attempt")).toBe("cancelled");
    expect(normalizePaymentStatus("")).toBe("unknown");
  });

  it("builds property options without duplicates", () => {
    const options = buildPropertyOptions([
      createRow({
        paymentUuid: "pay-1",
        propertyId: 5,
        propertyTitle: "Casa Roma",
      }),
      createRow({
        paymentUuid: "pay-2",
        propertyId: 8,
        propertyTitle: "Casa Roma",
      }),
      createRow({
        paymentUuid: "pay-3",
        propertyId: 9,
        propertyTitle: "Loft Centro",
      }),
    ]);

    expect(options).toEqual([
      { value: "casa roma", label: "Casa Roma" },
      { value: "loft centro", label: "Loft Centro" },
    ]);
  });

  it("filters real and simulated rows for the same property together", () => {
    const rows = [
      createRow({
        paymentUuid: "pay-1",
        propertyId: 5,
        propertyTitle: "Casa Roma",
        isSimulated: false,
      }),
      createRow({
        paymentUuid: "sim-1",
        propertyId: 0,
        propertyTitle: "Casa Roma",
        isSimulated: true,
      }),
      createRow({
        paymentUuid: "pay-2",
        propertyId: 9,
        propertyTitle: "Loft Centro",
      }),
    ];

    const filtered = filterPaymentsRows(rows, {
      propertyKey: "casa roma",
      statusKey: "",
      dateFrom: "",
      dateTo: "",
    });

    expect(filtered.map((row) => row.paymentUuid)).toEqual(["pay-1", "sim-1"]);
  });

  it("applies an inclusive date range", () => {
    const rows = [
      createRow({ paymentUuid: "pay-1", dueDate: "2024-03-10" }),
      createRow({ paymentUuid: "pay-2", dueDate: "2024-03-15" }),
      createRow({ paymentUuid: "pay-3", dueDate: "2024-03-20" }),
    ];

    const filtered = filterPaymentsRows(rows, {
      propertyKey: "",
      statusKey: "",
      dateFrom: "2024-03-10",
      dateTo: "2024-03-15",
    });

    expect(filtered.map((row) => row.paymentUuid)).toEqual(["pay-1", "pay-2"]);
  });

  it("keeps ISO timestamps on their original calendar day", () => {
    expect(getStableCalendarDate("2024-03-10T23:30:00.000Z")).toBe("2024-03-10");
    expect(
      filterPaymentsRows(
        [createRow({ paymentUuid: "pay-iso", dueDate: "2024-03-10T23:30:00.000Z" })],
        {
          propertyKey: "",
          statusKey: "",
          dateFrom: "2024-03-10",
          dateTo: "2024-03-10",
        },
      ).map((row) => row.paymentUuid),
    ).toEqual(["pay-iso"]);
  });

  it("paginates the filtered result", () => {
    const filtered = Array.from({ length: 5 }, (_, index) =>
      createRow({
        paymentUuid: `pay-${index + 1}`,
      }),
    );

    const page = paginateFilteredPayments(filtered, 2, 2);

    expect(page.totalCount).toBe(5);
    expect(page.totalPages).toBe(3);
    expect(page.currentPage).toBe(2);
    expect(page.pageRows.map((row) => row.paymentUuid)).toEqual(["pay-3", "pay-4"]);
  });
});
