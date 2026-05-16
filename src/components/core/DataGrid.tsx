"use client";

import * as React from "react";

const MIN_COLUMN_WIDTH = 96;

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export type DataGridRowBase = {
  id: string;
};

export type EditingCell<ColumnId extends string> = {
  rowId: string;
  columnId: ColumnId;
};

export type DataGridColumn<ColumnId extends string> = {
  id: ColumnId;
  label: React.ReactNode;
  width?: number;
  minWidth?: number;
  align?: "left" | "center" | "right";
  className?: string;
  sticky?: "left" | "right";
};

export type DataGridToolbarRenderProps<
  Row extends DataGridRowBase,
  ColumnId extends string,
> = {
  rows: Row[];
  columns: DataGridColumn<ColumnId>[];
  visibleRowCount: number;
  showSummaries: boolean;
  onShowSummariesChange: React.Dispatch<React.SetStateAction<boolean>>;
};

export type DataGridProps<
  Row extends DataGridRowBase,
  ColumnId extends string,
> = {
  rows: Row[];
  columns: DataGridColumn<ColumnId>[];
  renderCell: (row: Row, columnId: ColumnId) => React.ReactNode;
  getCellEditValue?: (row: Row, columnId: ColumnId) => string;
  applyCellEdit?: (row: Row, columnId: ColumnId, nextValue: string) => Row;
  isEditableColumn?: (columnId: ColumnId, row: Row) => boolean;
  renderSummary?: (
    columnId: ColumnId,
    rows: Row[],
    column: DataGridColumn<ColumnId>,
  ) => React.ReactNode;
  renderToolbar?: (
    props: DataGridToolbarRenderProps<Row, ColumnId>,
  ) => React.ReactNode;
  onToolbarPropsChange?: (
    props: DataGridToolbarRenderProps<Row, ColumnId>,
  ) => void;
  onRowsChange?: (rows: Row[]) => void;
  fillAvailableHeight?: boolean;
  stickySummaryFooter?: boolean;
  tableContainerClassName?: string;
  getRowLabel?: (row: Row) => string;
};

function getColumnAlignmentClass(align?: DataGridColumn<string>["align"]) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function isEmptyValue(value: React.ReactNode) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return false;
}

function getStickyColumnClass(sticky?: DataGridColumn<string>["sticky"]) {
  if (sticky === "left") return "sticky left-0 z-10 relative";
  if (sticky === "right") return "sticky right-0 z-10 relative";
  return "";
}

function getColumnStyle(
  width: number | undefined,
  sticky: DataGridColumn<string>["sticky"],
  rightStickyMaskOpacity?: number,
): React.CSSProperties {
  const style: React.CSSProperties & {
    "--sticky-right-mask-opacity"?: string;
  } = {};

  if (width) {
    style.width = width;
    style.minWidth = width;
    style.maxWidth = width;
  }

  if (sticky === "right" && rightStickyMaskOpacity !== undefined) {
    style["--sticky-right-mask-opacity"] = String(rightStickyMaskOpacity);
  }

  return style;
}

export function DataGrid<Row extends DataGridRowBase, ColumnId extends string>({
  rows,
  columns,
  renderCell,
  getCellEditValue,
  applyCellEdit,
  isEditableColumn,
  renderSummary,
  renderToolbar,
  onToolbarPropsChange,
  onRowsChange,
  fillAvailableHeight = false,
  stickySummaryFooter = false,
  tableContainerClassName,
  getRowLabel,
}: DataGridProps<Row, ColumnId>) {
  const [showSummaries, setShowSummaries] = React.useState(true);
  const [editingCell, setEditingCell] =
    React.useState<EditingCell<ColumnId> | null>(null);
  const [draftValue, setDraftValue] = React.useState("");
  const [resizedColumnWidths, setResizedColumnWidths] = React.useState<
    Record<string, number | undefined>
  >(() =>
    Object.fromEntries(columns.map((column) => [column.id, column.width])),
  );
  const [rightStickyMaskOpacity, setRightStickyMaskOpacity] = React.useState(0);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (editingCell) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editingCell]);

  const columnWidths = React.useMemo(
    () =>
      Object.fromEntries(
        columns.map((column) => [
          column.id,
          resizedColumnWidths[column.id] ?? column.width,
        ]),
      ) as Record<ColumnId, number | undefined>,
    [columns, resizedColumnWidths],
  );

  const commitRows = React.useCallback(
    (updater: (currentRows: Row[]) => Row[]) => {
      onRowsChange?.(updater(rows));
    },
    [onRowsChange, rows],
  );

  const startEditing = React.useCallback(
    (row: Row, columnId: ColumnId) => {
      if (!getCellEditValue || !applyCellEdit) return;
      if (!isEditableColumn?.(columnId, row)) return;

      setEditingCell({
        rowId: row.id,
        columnId,
      });
      setDraftValue(getCellEditValue(row, columnId));
    },
    [applyCellEdit, getCellEditValue, isEditableColumn],
  );

  const cancelEdit = React.useCallback(() => {
    setEditingCell(null);
    setDraftValue("");
  }, []);

  const commitEdit = React.useCallback(() => {
    if (!editingCell || !applyCellEdit) return;

    commitRows((currentRows) =>
      currentRows.map((row) =>
        row.id === editingCell.rowId
          ? applyCellEdit(row, editingCell.columnId, draftValue)
          : row,
      ),
    );

    cancelEdit();
  }, [applyCellEdit, cancelEdit, commitRows, draftValue, editingCell]);

  const beginResize = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>, columnId: ColumnId) => {
      event.preventDefault();

      const column = columns.find((item) => item.id === columnId);
      const minWidth = column?.minWidth ?? MIN_COLUMN_WIDTH;
      const initialWidth =
        columnWidths[columnId] ?? column?.width ?? Math.max(minWidth, 160);
      const startX = event.clientX;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - startX;
        setResizedColumnWidths((current) => ({
          ...current,
          [columnId]: Math.max(minWidth, initialWidth + delta),
        }));
      };

      const handlePointerUp = () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [columnWidths, columns],
  );

  const toolbarProps = React.useMemo(
    () => ({
      rows,
      columns,
      visibleRowCount: rows.length,
      showSummaries,
      onShowSummariesChange: setShowSummaries,
    }),
    [columns, rows, showSummaries],
  );

  React.useEffect(() => {
    onToolbarPropsChange?.(toolbarProps);
  }, [onToolbarPropsChange, toolbarProps]);

  React.useEffect(() => {
    const element = tableContainerRef.current;

    if (!element) return;

    const updateStickyMaskOpacity = () => {
      const remainingScroll =
        element.scrollWidth - element.clientWidth - element.scrollLeft;
      const fadeDistance = 64;
      const nextOpacity = Math.max(
        0,
        Math.min(1, remainingScroll / fadeDistance),
      );

      setRightStickyMaskOpacity(nextOpacity);
    };

    updateStickyMaskOpacity();

    element.addEventListener("scroll", updateStickyMaskOpacity, {
      passive: true,
    });
    window.addEventListener("resize", updateStickyMaskOpacity);

    return () => {
      element.removeEventListener("scroll", updateStickyMaskOpacity);
      window.removeEventListener("resize", updateStickyMaskOpacity);
    };
  }, [columns, rows.length]);

  return (
    <div
      className={cn("min-h-0", fillAvailableHeight && "flex h-full flex-col")}
    >
      {renderToolbar?.(toolbarProps)}

      <div className={cn(fillAvailableHeight && "min-h-0 flex-1")}>
        <div
          ref={tableContainerRef}
          className={cn(
            "min-h-0 overflow-auto rounded-xl border border-slate-200 bg-white",
            tableContainerClassName,
          )}
        >
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column, columnIndex) => {
                  const width = columnWidths[column.id];
                  const isLastColumn = columnIndex === columns.length - 1;

                  return (
                    <th
                      key={column.id}
                      className={cn(
                        "relative border-b border-slate-200 px-3 py-3 text-sm font-medium text-muted",
                        column.sticky === "right" &&
                          "bg-slate-50 shadow-[-1px_0_0_0_rgba(226,232,240,1)] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:bg-slate-50 after:content-['']",
                        column.sticky === "left" &&
                          "bg-slate-50 shadow-[1px_0_0_0_rgba(226,232,240,1)]",
                        column.sticky === "right" &&
                          "before:pointer-events-none before:absolute before:inset-y-0 before:-left-10 before:z-0 before:w-10 before:bg-linear-to-l before:from-slate-50 before:to-transparent before:opacity-(--sticky-right-mask-opacity) before:transition-opacity before:duration-200",
                        getColumnAlignmentClass(column.align),
                        getStickyColumnClass(column.sticky),
                        column.className,
                      )}
                      scope="col"
                      style={getColumnStyle(
                        width,
                        column.sticky,
                        rightStickyMaskOpacity,
                      )}
                    >
                      <div className="relative z-10 flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate">
                          {column.label}
                        </span>
                      </div>
                      {!isLastColumn ? (
                        <div
                          aria-hidden="true"
                          className="absolute inset-y-0 right-0 z-20 w-2 cursor-col-resize select-none after:absolute after:inset-y-2 after:right-0 after:w-px after:bg-slate-200 after:transition-colors hover:after:bg-slate-300"
                          onPointerDown={(event) =>
                            beginResize(event, column.id)
                          }
                        />
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  aria-label={getRowLabel?.(row)}
                  className="odd:bg-white even:bg-slate-50"
                >
                  {columns.map((column) => {
                    const isEditing =
                      editingCell?.rowId === row.id &&
                      editingCell.columnId === column.id;
                    const isEditable =
                      isEditableColumn?.(column.id, row) ?? false;
                    const width = columnWidths[column.id];
                    const cellContent = renderCell(row, column.id);

                    return (
                      <td
                        key={column.id}
                        className={cn(
                          "border-b border-slate-200 px-3 py-3 align-middle text-sm text-foreground",
                          column.sticky === "right" &&
                            "shadow-[-1px_0_0_0_rgba(226,232,240,1)] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:content-[''] before:pointer-events-none before:absolute before:inset-y-0 before:-left-10 before:z-0 before:w-10 before:bg-linear-to-l before:opacity-(--sticky-right-mask-opacity) before:transition-opacity before:duration-200",
                          column.sticky === "left" &&
                            "shadow-[1px_0_0_0_rgba(226,232,240,1)]",
                          getColumnAlignmentClass(column.align),
                          getStickyColumnClass(column.sticky),
                          isEditable &&
                            "cursor-text transition hover:bg-slate-100",
                          column.className,
                          column.sticky === "right" || column.sticky === "left"
                            ? rowIndex % 2 === 0
                              ? "bg-white after:bg-white before:from-white before:to-transparent"
                              : "bg-slate-50 after:bg-slate-50 before:from-slate-50 before:to-transparent"
                            : "",
                        )}
                        onDoubleClick={() => startEditing(row, column.id)}
                        style={getColumnStyle(
                          width,
                          column.sticky,
                          rightStickyMaskOpacity,
                        )}
                      >
                        {isEditing ? (
                          <div className="relative z-10">
                            <input
                              ref={inputRef}
                              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0"
                              onBlur={commitEdit}
                              onChange={(event) =>
                                setDraftValue(event.currentTarget.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  commitEdit();
                                }

                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelEdit();
                                }
                              }}
                              value={draftValue}
                            />
                          </div>
                        ) : isEmptyValue(cellContent) ? (
                          <span className="relative z-10 text-slate-400">
                            -
                          </span>
                        ) : (
                          <div className="relative z-10">{cellContent}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {renderSummary && showSummaries ? (
              <tfoot
                className={cn(
                  stickySummaryFooter &&
                    "sticky bottom-0 z-10 bg-white shadow-[0_-1px_0_0_rgba(226,232,240,1)]",
                )}
              >
                <tr>
                  {columns.map((column) => {
                    const width = columnWidths[column.id];

                    return (
                      <td
                        key={column.id}
                        className={cn(
                          "border-t border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700",
                          column.sticky === "right" &&
                            "shadow-[-1px_0_0_0_rgba(226,232,240,1)]",
                          column.sticky === "left" &&
                            "shadow-[1px_0_0_0_rgba(226,232,240,1)]",
                          getColumnAlignmentClass(column.align),
                          getStickyColumnClass(column.sticky),
                          column.className,
                        )}
                        style={getColumnStyle(width, column.sticky)}
                      >
                        {renderSummary(column.id, rows, column)}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </div>
    </div>
  );
}
