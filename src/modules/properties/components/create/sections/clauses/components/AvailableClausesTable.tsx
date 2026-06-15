"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
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
import type { Clause } from "@clauses/domain/clause.entity";
import { useClausesTranslation } from "@clauses/i18n/useClausesTranslation";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type AvailableClauseColumnId = "clause" | "description" | "action";

type AvailableClauseGridRow = DataGridRowBase & {
  clause: Clause;
};

type AvailableClausesTableProps = {
  clauses: Clause[];
  onAdd: (clauseId: number, valueTypeCode: Clause["valueType"]["code"]) => void;
};

export function AvailableClausesTable({
  clauses,
  onAdd,
}: AvailableClausesTableProps) {
  const { t } = usePropertiesTranslation();
  const { tClause, tClauseDescription } = useClausesTranslation();

  const columns: DataGridColumn<AvailableClauseColumnId>[] = [
    { id: "clause", label: t("create.clauses.columnClause"), width: 248 },
    {
      id: "description",
      label: t("create.clauses.columnDescription"),
      width: 320,
    },
    {
      id: "action",
      label: "",
      width: 72,
      align: "right",
    },
  ];

  const rows: AvailableClauseGridRow[] = clauses.map((clause) => ({
    id: String(clause.clauseId),
    clause,
  }));

  return (
    <DataGrid<AvailableClauseGridRow, AvailableClauseColumnId>
      columns={columns}
      fillAvailableHeight={false}
      getRowLabel={(row) => tClause(row.clause.code)}
      renderCell={(row, columnId) => {
        if (columnId === "clause") {
          return (
            <span className="truncate text-sm text-foreground">
              {tClause(row.clause.code)}
            </span>
          );
        }

        if (columnId === "description") {
          return (
            <span className="text-sm text-muted-foreground">
              {tClauseDescription(row.clause.code)}
            </span>
          );
        }

        return (
          <div className="flex w-full justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={t("create.clauses.addAriaLabel", {
                    clause: tClause(row.clause.code),
                  })}
                  className="rounded-2xl"
                  size="icon-sm"
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    onAdd(row.clause.clauseId, row.clause.valueType.code)
                  }
                >
                  <HugeiconsIcon
                    icon={Add01Icon}
                    size={14}
                    strokeWidth={1.8}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {t("create.clauses.add")}
              </TooltipContent>
            </Tooltip>
          </div>
        );
      }}
      rows={rows}
      tableContainerClassName="overflow-hidden"
    />
  );
}
