import type { PaymentListItem } from "../domain/payments.entity";

export type PaymentStatusKey =
  | "approved"
  | "cancelled"
  | "completed"
  | "failed"
  | "pending"
  | "rejected"
  | "unknown";

export type PaymentPropertyOption = {
  label: string;
  value: string;
};

export type PaymentStatusOption = {
  label: PaymentStatusKey;
  value: PaymentStatusKey;
};

export type PaymentPageFilterState = {
  propertyKey: string;
  statusKey: PaymentStatusKey | "";
  dateFrom: string;
  dateTo: string;
};

export type PaymentFilterableRow = Pick<
  PaymentListItem,
  "amount" | "billingPeriod" | "currency" | "dueDate" | "paymentDate" | "paymentMethod" | "propertyId" | "status"
> & {
  paymentUuid: string;
  propertyTitle?: string;
  isSimulated?: boolean;
};

const STATUS_ALIASES: Record<string, PaymentStatusKey> = {
  aprobado: "approved",
  approved: "approved",
  cancelado: "cancelled",
  cancelled: "cancelled",
  cancelled_by_new_attempt: "cancelled",
  canceled: "cancelled",
  completado: "completed",
  completed: "completed",
  exito: "completed",
  exitoso: "completed",
  failed: "failed",
  fallido: "failed",
  paid: "completed",
  pagado: "completed",
  pendiente: "pending",
  pending: "pending",
  rejected: "rejected",
  rechazado: "rejected",
  success: "completed",
  unpaid: "pending",
};

const STATUS_ORDER: PaymentStatusKey[] = [
  "pending",
  "approved",
  "completed",
  "failed",
  "rejected",
  "cancelled",
  "unknown",
];

function simplifyText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizePaymentStatus(status: string | null | undefined): PaymentStatusKey {
  if (!status || status.trim() === "") {
    return "unknown";
  }

  return STATUS_ALIASES[simplifyText(status)] ?? "unknown";
}

export function isVisiblePaymentStatus(status: string | null | undefined) {
  const normalized = normalizePaymentStatus(status);
  return (
    normalized !== "cancelled" &&
    normalized !== "failed" &&
    normalized !== "rejected"
  );
}

export function getStableCalendarDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getUTCFullYear();
  const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const day = String(parsed.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPaymentPropertyKey(row: Pick<PaymentFilterableRow, "propertyId" | "propertyTitle">) {
  const title = row.propertyTitle?.trim();

  if (title) {
    return simplifyText(title);
  }

  if (row.propertyId > 0) {
    return `property:${row.propertyId}`;
  }

  return "";
}

export function buildPropertyOptions<T extends PaymentFilterableRow>(
  rows: T[],
): PaymentPropertyOption[] {
  const optionsByValue = new Map<string, PaymentPropertyOption>();

  for (const row of rows) {
    const value = getPaymentPropertyKey(row);
    const label = row.propertyTitle?.trim();

    if (!value || !label || optionsByValue.has(value)) {
      continue;
    }

    optionsByValue.set(value, {
      value,
      label,
    });
  }

  return Array.from(optionsByValue.values()).sort((left, right) =>
    left.label.localeCompare(right.label),
  );
}

export function buildStatusOptions<T extends PaymentFilterableRow>(
  rows: T[],
): PaymentStatusOption[] {
  const statusSet = new Set<PaymentStatusKey>();

  for (const row of rows) {
    statusSet.add(normalizePaymentStatus(row.status));
  }

  return STATUS_ORDER.filter((status) => statusSet.has(status)).map((status) => ({
    value: status,
    label: status,
  }));
}

export function matchesInclusiveDateRange(
  value: string | null | undefined,
  dateFrom: string,
  dateTo: string,
) {
  const stableDate = getStableCalendarDate(value);

  if (!stableDate) {
    return false;
  }

  if (dateFrom && stableDate < dateFrom) {
    return false;
  }

  if (dateTo && stableDate > dateTo) {
    return false;
  }

  return true;
}

export function filterPaymentsRows<T extends PaymentFilterableRow>(
  rows: T[],
  filters: PaymentPageFilterState,
): T[] {
  return rows.filter((row) => {
    if (filters.propertyKey && getPaymentPropertyKey(row) !== filters.propertyKey) {
      return false;
    }

    if (
      filters.statusKey &&
      normalizePaymentStatus(row.status) !== filters.statusKey
    ) {
      return false;
    }

    if (filters.dateFrom || filters.dateTo) {
      return matchesInclusiveDateRange(row.dueDate, filters.dateFrom, filters.dateTo);
    }

    return true;
  });
}

export function paginateFilteredPayments<T>(
  rows: T[],
  page: number,
  pageSize: number,
) {
  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    currentPage: safePage,
    pageRows: rows.slice(start, start + pageSize),
    totalCount,
    totalPages,
  };
}
