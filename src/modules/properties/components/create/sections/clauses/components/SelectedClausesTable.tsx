"use client";

import {
  InformationCircleIcon,
  Remove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  DataGrid,
  type DataGridColumn,
  type DataGridRowBase,
} from "@/components/core/DataGrid";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  Clause,
  ClauseEntry,
  ClauseValue,
} from "@clauses/domain/clause.entity";
import { useClausesTranslation } from "@clauses/i18n/useClausesTranslation";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { ClauseRow } from "./ClauseRow";

type SelectedClauseColumnId = "clause" | "value" | "action";

type SelectedClauseGridRow = DataGridRowBase & {
  clause: Clause;
  entry: ClauseEntry;
};

type SelectedClausesTableProps = {
  clauses: Clause[];
  entries: ClauseEntry[];
  onChange: (clauseId: number, next: ClauseValue) => void;
  onRemove: (clauseId: number) => void;
};

export function SelectedClausesTable({
  clauses,
  entries,
  onChange,
  onRemove,
}: SelectedClausesTableProps) {
  const { t } = usePropertiesTranslation();
  const { tClause, tClauseDescription } = useClausesTranslation();

  const columns: DataGridColumn<SelectedClauseColumnId>[] = [
    { id: "clause", label: t("create.clauses.columnClause"), width: 248 },
    { id: "value", label: t("create.clauses.columnValue"), width: 280 },
    {
      id: "action",
      label: "",
      width: 72,
      align: "right",
    },
  ];

  const rows: SelectedClauseGridRow[] = clauses
    .map((clause) => {
      const entry = entries.find((current) => current.clauseId === clause.clauseId);

      if (!entry) {
        return null;
      }

      return {
        id: String(clause.clauseId),
        clause,
        entry,
      };
    })
    .filter((row): row is SelectedClauseGridRow => row !== null);

  return (
    <DataGrid<SelectedClauseGridRow, SelectedClauseColumnId>
      columns={columns}
      fillAvailableHeight={false}
      getRowLabel={(row) => tClause(row.clause.code)}
      renderCell={(row, columnId) => {
        if (columnId === "clause") {
          return (
            <div className="flex w-full items-center justify-between gap-3">
              <span className="truncate text-sm text-foreground">
                {tClause(row.clause.code)}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    aria-label={t("create.clauses.descriptionTooltipAriaLabel", {
                      clause: tClause(row.clause.code),
                    })}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    type="button"
                  >
                    <HugeiconsIcon
                      icon={InformationCircleIcon}
                      size={15}
                      strokeWidth={1.8}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  {tClauseDescription(row.clause.code)}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        }

        if (columnId === "action") {
          return (
            <div className="flex w-full justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    aria-label={t("create.clauses.removeAriaLabel", {
                      clause: tClause(row.clause.code),
                    })}
                    className=""
                    size="icon-sm"
                    type="button"
                    variant="destructive"
                    onClick={() => onRemove(row.clause.clauseId)}
                  >
                    <HugeiconsIcon
                      icon={Remove01Icon}
                      size={14}
                      strokeWidth={1.8}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={8}>
                  {t("create.clauses.remove")}
                </TooltipContent>
              </Tooltip>
            </div>
          );
        }

        return (
          <ClauseRow
            clause={row.clause}
            entry={row.entry}
            onChange={onChange}
          />
        );
      }}
      rows={rows}
      tableContainerClassName="overflow-hidden"
    />
  );
}
