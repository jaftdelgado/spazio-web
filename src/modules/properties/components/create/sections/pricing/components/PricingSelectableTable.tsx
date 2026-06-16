"use client";

import {
  DollarCircleIcon,
  NoteIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type SelectablePriceRow = {
  id: string;
  label: string;
  amount: number | null;
  suffix: string;
  enabled: boolean;
  toggleDisabled?: boolean;
};

export function PricingSelectableTable({
  rows,
  selectedRowId,
  formatPrice,
  tableAriaLabel,
  activeColumnLabel,
  typeColumnLabel,
  amountColumnLabel,
  emptyState,
  onSelectionChange,
  onToggleRow,
}: {
  rows: SelectablePriceRow[];
  selectedRowId: string | null;
  formatPrice: (amount: number, suffix: string) => string;
  tableAriaLabel: string;
  activeColumnLabel: string;
  typeColumnLabel: string;
  amountColumnLabel: string;
  emptyState?: {
    title: string;
    description: string;
  };
  onSelectionChange: (rowId: string) => void;
  onToggleRow: (rowId: string, enabled: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
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
                <th className="w-16 border-b border-border/70 px-3 py-3 text-left text-sm font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <HugeiconsIcon icon={Tick02Icon} size={15} strokeWidth={1.8} />
                    <span>{activeColumnLabel}</span>
                  </span>
                </th>
                <th className="border-b border-border/70 px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <HugeiconsIcon icon={NoteIcon} size={15} strokeWidth={1.8} />
                    <span>{typeColumnLabel}</span>
                  </span>
                </th>
                <th className="border-b border-border/70 px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <HugeiconsIcon icon={DollarCircleIcon} size={15} strokeWidth={1.8} />
                    <span>{amountColumnLabel}</span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isSelected = row.id === selectedRowId;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors",
                      isSelected
                        ? "bg-primary/8 hover:bg-primary/12"
                        : "bg-transparent hover:bg-muted/35",
                    )}
                  >
                    <td className="border-b border-border/60 px-3 py-3 last:border-b-0">
                      <div
                        className="flex w-full justify-center"
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectionChange(row.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectionChange(row.id);
                          }
                        }}
                      >
                      <Checkbox
                        checked={row.enabled}
                        disabled={row.toggleDisabled}
                        onCheckedChange={(checked) =>
                          onToggleRow(row.id, checked === true)
                        }
                        onClick={(event) => event.stopPropagation()}
                      />
                      </div>
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 text-sm last:border-b-0">
                      <button
                        className="w-full text-left"
                        type="button"
                        onClick={() => onSelectionChange(row.id)}
                      >
                        <span
                          className={cn(
                            "font-medium",
                            row.enabled ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {row.label}
                        </span>
                      </button>
                    </td>
                    <td className="border-b border-border/60 px-4 py-3 text-right text-sm tabular-nums text-muted-foreground last:border-b-0">
                      <button
                        className="w-full text-right"
                        type="button"
                        onClick={() => onSelectionChange(row.id)}
                      >
                        {row.amount === null ? "—" : `$${formatPrice(row.amount, row.suffix)}`}
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
