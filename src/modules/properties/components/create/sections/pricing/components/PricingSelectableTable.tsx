"use client";

import type { Selection } from "@heroui/react";

import * as React from "react";
import { Description, Table } from "@heroui/react";

export type SelectablePriceRow = {
  id: string;
  label: string;
  amount: number | null;
  suffix: string;
};

export function PricingSelectableTable({
  rows,
  selectedRowId,
  formatPrice,
  title,
  hint,
  tableAriaLabel,
  typeColumnLabel,
  amountColumnLabel,
  emptyState,
  onSelectionChange,
}: {
  rows: SelectablePriceRow[];
  selectedRowId: string | null;
  formatPrice: (amount: number, suffix: string) => string;
  title: string;
  hint: string;
  tableAriaLabel: string;
  typeColumnLabel: string;
  amountColumnLabel: string;
  emptyState?: {
    title: string;
    description: string;
  };
  onSelectionChange: (rowId: string) => void;
}) {
  const selectedKeys = React.useMemo<Selection>(
    () => (selectedRowId ? new Set([selectedRowId]) : new Set()),
    [selectedRowId],
  );

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        <Description className="mt-1 text-xs leading-relaxed">
          {hint}
        </Description>
      </div>

      {emptyState ? (
        <SurfaceFallback
          description={emptyState.description}
          title={emptyState.title}
        />
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label={tableAriaLabel}
              selectedKeys={selectedKeys}
              selectionMode="single"
              onSelectionChange={(keys) => {
                if (keys === "all") {
                  return;
                }

                const firstKey = Array.from(keys)[0];

                if (typeof firstKey === "string") {
                  onSelectionChange(firstKey);
                }
              }}
            >
              <Table.Header>
                <Table.Column isRowHeader>{typeColumnLabel}</Table.Column>
                <Table.Column>{amountColumnLabel}</Table.Column>
              </Table.Header>
              <Table.Body items={rows}>
                {(row) => (
                  <Table.Row id={row.id}>
                    <Table.Cell>{row.label}</Table.Cell>
                    <Table.Cell>
                      ${formatPrice(row.amount ?? 0, row.suffix)}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  );
}

function SurfaceFallback({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-default-200 px-5 py-6">
      <div className="text-sm font-medium text-slate-900">{title}</div>
      <Description className="mt-1 text-sm leading-relaxed">
        {description}
      </Description>
    </div>
  );
}
