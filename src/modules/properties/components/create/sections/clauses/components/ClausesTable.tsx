"use client";

import {
  DataGrid,
  type DataGridColumn,
  type DataGridRowBase,
} from "@/components/core/DataGrid";
import type {
  Clause,
  ClauseEntry,
  ClauseValue,
  ClauseValueTypeCode,
} from "@clauses/domain/clause.entity";
import { useClausesTranslation } from "@clauses/i18n/useClausesTranslation";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { ClauseRow } from "./ClauseRow";

type ClauseColumnId = "clause" | "value";

type ClauseGridRow = DataGridRowBase & {
  clause: Clause;
  entry: ClauseEntry;
};

type ClausesTableProps = {
  clauses: Clause[];
  entries: ClauseEntry[];
  onChange: (clauseId: number, next: ClauseValue) => void;
};

function getDefaultValue(code: ClauseValueTypeCode): ClauseValue {
  if (code === "boolean") {
    return { type: "boolean", value: false };
  }

  if (code === "range") {
    return { type: "range", min: null, max: null };
  }

  return { type: "integer", value: null };
}

export function ClausesTable({
  clauses,
  entries,
  onChange,
}: ClausesTableProps) {
  const { t } = usePropertiesTranslation();
  const { tClause } = useClausesTranslation();

  const columns: DataGridColumn<ClauseColumnId>[] = [
    { id: "clause", label: t("create.clauses.columnClause"), width: 260 },
    { id: "value", label: t("create.clauses.columnValue"), width: 320 },
  ];

  const rows: ClauseGridRow[] = clauses.map((clause) => {
    const existingEntry = entries.find((entry) => entry.clauseId === clause.clauseId);

    return {
      id: String(clause.clauseId),
      clause,
      entry: existingEntry ?? {
        clauseId: clause.clauseId,
        value: getDefaultValue(clause.valueType.code),
      },
    };
  });

  return (
    <DataGrid<ClauseGridRow, ClauseColumnId>
      columns={columns}
      fillAvailableHeight={false}
      renderCell={(row, columnId) => {
        if (columnId === "clause") {
          return (
            <span className="text-sm text-foreground">
              {tClause(row.clause.code)}
            </span>
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
    />
  );
}
