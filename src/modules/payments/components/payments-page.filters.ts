"use client";

import type { ContractListItemEntity } from "@/modules/contracts/domain/contracts.entity";
import type { PropertyCard } from "@/modules/properties/domain/property.entity";

export type FilterablePaymentRow = {
  paymentUuid: string;
  propertyId: number;
  propertyTitle?: string;
  dueDate: string;
  status: string;
  isSimulated?: boolean;
};

export type PaymentPropertyOption = {
  value: string;
  label: string;
  propertyId?: number;
};

export type PaymentStatusOption = {
  value: string;
  label: string;
};

export type PaymentFilterFormState = {
  propertyValue: string;
  statusValue: string;
  dateFrom: string;
  dateTo: string;
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function normalizePaymentStatus(status: string | null | undefined) {
  const normalized = normalizeText(status);

  if (
    normalized === "pending" ||
    normalized === "pendiente" ||
    normalized === "unpaid"
  ) {
    return "pending";
  }

  if (
    normalized === "completed" ||
    normalized === "completado" ||
    normalized === "success" ||
    normalized === "exitoso" ||
    normalized === "paid" ||
    normalized === "pagado"
  ) {
    return "completed";
  }

  if (normalized === "approved" || normalized === "aprobado") {
    return "approved";
  }

  if (normalized === "failed" || normalized === "fallido") {
    return "failed";
  }

  if (normalized === "cancelled" || normalized === "cancelado") {
    return "cancelled";
  }

  return normalized;
}

export function buildPaymentPropertyOptions({
  properties,
  rows,
  contracts,
}: {
  properties: PropertyCard[];
  rows: FilterablePaymentRow[];
  contracts: ContractListItemEntity[];
}) {
  const options = new Map<string, PaymentPropertyOption>();
  const optionKeyByNormalizedLabel = new Map<string, string>();

  function upsertOption(option: PaymentPropertyOption) {
    const normalizedLabel = normalizeText(option.label);

    if (normalizedLabel.length === 0) {
      return;
    }

    const existingKey = optionKeyByNormalizedLabel.get(normalizedLabel);

    if (!existingKey) {
      options.set(option.value, option);
      optionKeyByNormalizedLabel.set(normalizedLabel, option.value);
      return;
    }

    const existingOption = options.get(existingKey);

    if (!existingOption) {
      options.set(option.value, option);
      optionKeyByNormalizedLabel.set(normalizedLabel, option.value);
      return;
    }

    const existingHasPropertyId = existingOption.propertyId !== undefined;
    const nextHasPropertyId = option.propertyId !== undefined;

    if (!existingHasPropertyId && nextHasPropertyId) {
      options.delete(existingKey);
      options.set(option.value, option);
      optionKeyByNormalizedLabel.set(normalizedLabel, option.value);
    }
  }

  for (const property of properties) {
    const label = property.title.trim();

    if (label.length === 0) {
      continue;
    }

    upsertOption({
      value: `property:${property.propertyId}`,
      label,
      propertyId: property.propertyId,
    });
  }

  for (const row of rows) {
    const label = row.propertyTitle?.trim();

    if (!label) {
      continue;
    }

    const value =
      row.propertyId > 0 ? `property:${row.propertyId}` : `title:${label.toLowerCase()}`;

    if (!options.has(value)) {
      upsertOption({
        value,
        label,
        propertyId: row.propertyId > 0 ? row.propertyId : undefined,
      });
    }
  }

  for (const contract of contracts) {
    const label = contract.propertyTitle.trim();

    if (label.length === 0) {
      continue;
    }

    const value = `title:${label.toLowerCase()}`;

    if (!options.has(value)) {
      upsertOption({
        value,
        label,
      });
    }
  }

  return Array.from(options.values()).sort((left, right) =>
    left.label.localeCompare(right.label, undefined, { sensitivity: "base" }),
  );
}

export function buildPaymentStatusOptions(rows: FilterablePaymentRow[]) {
  const options = new Map<string, PaymentStatusOption>();

  for (const row of rows) {
    const normalized = normalizePaymentStatus(row.status);

    if (normalized.length === 0 || options.has(normalized)) {
      continue;
    }

    options.set(normalized, {
      value: normalized,
      label: row.status,
    });
  }

  return Array.from(options.values()).sort((left, right) =>
    left.label.localeCompare(right.label, undefined, { sensitivity: "base" }),
  );
}

function resolveComparableDate(value: string) {
  const normalized = value.trim();

  const dateMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})/);

  if (dateMatch) {
    return dateMatch[1];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export function filterPaymentRows<TRow extends FilterablePaymentRow>({
  rows,
  filters,
  selectedProperty,
}: {
  rows: TRow[];
  filters: PaymentFilterFormState;
  selectedProperty?: PaymentPropertyOption;
}) {
  return rows.filter((row) => {
    if (filters.propertyValue && selectedProperty) {
      const propertyMatches =
        selectedProperty.propertyId !== undefined
          ? row.propertyId === selectedProperty.propertyId
          : normalizeText(row.propertyTitle) === normalizeText(selectedProperty.label);

      if (!propertyMatches) {
        return false;
      }
    }

    if (filters.statusValue) {
      const normalizedStatus = normalizePaymentStatus(row.status);

      if (normalizedStatus !== filters.statusValue) {
        return false;
      }
    }

    const comparableDueDate = resolveComparableDate(row.dueDate);

    if (filters.dateFrom && comparableDueDate < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && comparableDueDate > filters.dateTo) {
      return false;
    }

    return true;
  });
}

export function paginatePaymentRows<T>(rows: T[], page: number, pageSize: number) {
  const start = Math.max(0, (page - 1) * pageSize);

  return rows.slice(start, start + pageSize);
}
