"use client";

import { cn } from "@/lib/utils";

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
  title?: string;
  hint?: string;
  tableAriaLabel: string;
  typeColumnLabel: string;
  amountColumnLabel: string;
  emptyState?: {
    title: string;
    description: string;
  };
  onSelectionChange: (rowId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {title || hint ? (
        <div>
          {title ? (
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
          ) : null}
          {hint ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
      ) : null}

      {emptyState ? (
        <SurfaceFallback
          description={emptyState.description}
          title={emptyState.title}
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-background/80">
          <table aria-label={tableAriaLabel} className="w-full border-separate border-spacing-0">
            <thead className="bg-muted/30">
              <tr>
                <th className="border-b border-border/70 px-4 py-3 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {typeColumnLabel}
                </th>
                <th className="border-b border-border/70 px-4 py-3 text-right text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {amountColumnLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = row.id === selectedRowId;

                return (
                  <tr key={row.id}>
                    <td colSpan={2} className="p-0">
                      <button
                        aria-pressed={isSelected}
                        className={cn(
                          "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border/60 px-4 py-3 text-left text-sm transition-colors last:border-b-0",
                          isSelected
                            ? "bg-primary/8 text-foreground"
                            : "bg-transparent text-foreground hover:bg-muted/30",
                        )}
                        type="button"
                        onClick={() => onSelectionChange(row.id)}
                      >
                        <span className="font-medium">{row.label}</span>
                        <span className="text-right tabular-nums text-muted-foreground">
                          ${formatPrice(row.amount ?? 0, row.suffix)}
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
    <div className="rounded-3xl border border-dashed border-border bg-card px-5 py-6">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
