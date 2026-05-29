"use client";

import * as React from "react";

import {
  Building03Icon,
  Delete02Icon,
  DollarCircleIcon,
  Edit03Icon,
  Home07Icon,
  MapsLocation01Icon,
  MoreVerticalIcon,
  NoteIcon,
  RulerIcon,
  TaskDone02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Dropdown, Label, Chip, Skeleton } from "@heroui/react";

import {
  DataGrid,
  type DataGridColumn,
  type DataGridRowBase,
} from "@components/core/DataGrid";
import type { PropertyCard } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { PropertyDeleteAlertDialog } from "./PropertyDeleteAlertDialog";

type PropertyGridColumnId =
  | "title"
  | "propertyType"
  | "address"
  | "modality"
  | "status"
  | "price"
  | "builtArea"
  | "actions";

type PropertyGridRow = DataGridRowBase & PropertyCard;
type LoadingPropertyGridRow = DataGridRowBase & {
  isLoading: true;
};
type PropertiesDataGridRow = PropertyGridRow | LoadingPropertyGridRow;

const LOADING_ROW_COUNT = 8;

const columnLabel = (
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"],
  label: string,
) => (
  <span className="flex items-center gap-2 text-muted">
    <HugeiconsIcon className="h-4 w-4 shrink-0 text-muted" icon={icon} />
    <span>{label}</span>
  </span>
);

const formatCurrency = (price: PropertyCard["price"], locale: string) => {
  if (!price) return "-";

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);

  if (price.periodName) {
    return `${formattedAmount} / ${price.periodName}`;
  }

  return formattedAmount;
};

const formatArea = (value: number | null, locale: string) => {
  if (value === null) return "-";
  return `${new Intl.NumberFormat(locale).format(value)} m2`;
};

const formatAddress = (address: string | null | undefined) => {
  return address && address.trim().length > 0 ? address : "-";
};

function isLoadingRow(
  row: PropertiesDataGridRow,
): row is LoadingPropertyGridRow {
  return "isLoading" in row;
}

function renderLoadingCell(columnId: PropertyGridColumnId) {
  switch (columnId) {
    case "title":
      return <Skeleton className="h-4 w-40 rounded-lg" />;
    case "propertyType":
    case "modality":
    case "status":
      return <Skeleton className="h-4 w-24 rounded-full" />;
    case "address":
      return <Skeleton className="h-4 w-52 rounded-lg" />;
    case "price":
      return <Skeleton className="ml-auto h-4 w-28 rounded-lg" />;
    case "builtArea":
      return <Skeleton className="ml-auto h-4 w-16 rounded-lg" />;
    case "actions":
      return <Skeleton className="ml-auto h-4 w-4 rounded-lg" />;
    default:
      return null;
  }
}

function renderPropertyCell(
  row: PropertiesDataGridRow,
  columnId: PropertyGridColumnId,
  propertyAddressMap: Record<string, string | null>,
  locale: string,
  labels: {
    actionsAriaLabel: string;
    view: string;
    edit: string;
    delete: string;
  },
  onDeletePress: (row: PropertyGridRow) => void,
) {
  if (isLoadingRow(row)) {
    return renderLoadingCell(columnId);
  }

  switch (columnId) {
    case "title":
      return <div className="font-medium text-slate-950">{row.title}</div>;
    case "propertyType":
      return (
        <Chip color="accent" variant="secondary">
          <Chip.Label>{row.propertyType.name}</Chip.Label>
        </Chip>
      );
    case "address":
      return formatAddress(propertyAddressMap[row.propertyUuid]);
    case "modality":
      return (
        <Chip color="accent" variant="secondary">
          <Chip.Label>{row.modality.name}</Chip.Label>
        </Chip>
      );
    case "status":
      return (
        <Chip color="accent" variant="secondary">
          <Chip.Label>{row.status.name}</Chip.Label>
        </Chip>
      );
    case "price":
      return (
        <span className="tabular-nums">{formatCurrency(row.price, locale)}</span>
      );
    case "builtArea":
      return (
        <span className="tabular-nums">
          {formatArea(row.builtArea, locale)}
        </span>
      );
    case "actions":
      return (
        <Dropdown>
          <Button
            isIconOnly
            aria-label={labels.actionsAriaLabel}
            size="sm"
            variant="ghost"
          >
            <HugeiconsIcon
              icon={MoreVerticalIcon}
              size={18}
              strokeWidth={1.8}
            />
          </Button>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu
              onAction={() => {
                // Placeholder until property detail/edit/delete flows are implemented.
              }}
            >
              <Dropdown.Item id="view" textValue={labels.view}>
                <HugeiconsIcon
                  className="size-4 shrink-0 text-slate-500"
                  icon={Building03Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <Label>{labels.view}</Label>
              </Dropdown.Item>
              <Dropdown.Item id="edit" textValue={labels.edit}>
                <HugeiconsIcon
                  className="size-4 shrink-0 text-slate-500"
                  icon={Edit03Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <Label>{labels.edit}</Label>
              </Dropdown.Item>
              <Dropdown.Item
                id="delete"
                textValue={labels.delete}
                variant="danger"
                onAction={() => onDeletePress(row)}
              >
                <HugeiconsIcon
                  className="size-4 shrink-0 text-danger"
                  icon={Delete02Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <Label>{labels.delete}</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      );
    default:
      return null;
  }
}

type PropertiesDataGridProps = {
  rows: PropertyGridRow[];
  propertyAddressMap: Record<string, string | null>;
  isLoading?: boolean;
};

export function PropertiesDataGrid({
  rows,
  propertyAddressMap,
  isLoading = false,
}: PropertiesDataGridProps) {
  const { intlLocale, t } = usePropertiesTranslation();
  const [propertyPendingDelete, setPropertyPendingDelete] =
    React.useState<PropertyGridRow | null>(null);
  const columns = React.useMemo<DataGridColumn<PropertyGridColumnId>[]>(
    () => [
      {
        id: "title",
        label: columnLabel(Home07Icon, t("columns.title")),
        width: 280,
        minWidth: 220,
      },
      {
        id: "propertyType",
        label: columnLabel(Building03Icon, t("columns.propertyType")),
        width: 160,
        minWidth: 140,
      },
      {
        id: "address",
        label: columnLabel(MapsLocation01Icon, t("columns.address")),
        width: 300,
        minWidth: 220,
      },
      {
        id: "modality",
        label: columnLabel(NoteIcon, t("columns.modality")),
        width: 150,
        minWidth: 130,
      },
      {
        id: "status",
        label: columnLabel(TaskDone02Icon, t("columns.status")),
        width: 150,
        minWidth: 130,
      },
      {
        id: "price",
        label: columnLabel(DollarCircleIcon, t("columns.price")),
        width: 180,
        minWidth: 160,
      },
      {
        id: "builtArea",
        label: columnLabel(RulerIcon, t("columns.builtArea")),
        width: 130,
        minWidth: 110,
      },
      {
        id: "actions",
        label: "",
        width: 56,
        minWidth: 56,
        align: "center",
        sticky: "right",
      },
    ],
    [t],
  );
  const actionLabels = React.useMemo(
    () => ({
      actionsAriaLabel: t("actions.ariaLabel"),
      view: t("actions.view"),
      edit: t("actions.edit"),
      delete: t("actions.delete"),
    }),
    [t],
  );
  const rowsToRender = React.useMemo<PropertiesDataGridRow[]>(
    () =>
      isLoading
        ? Array.from({ length: LOADING_ROW_COUNT }, (_, index) => ({
            id: `loading-row-${index}`,
            isLoading: true,
          }))
        : rows,
    [isLoading, rows],
  );

  return (
    <>
      <DataGrid<PropertiesDataGridRow, PropertyGridColumnId>
        columns={columns}
        fillAvailableHeight
        getRowLabel={(row) =>
          isLoadingRow(row) ? t("states.loadingRowLabel") : row.title
        }
        renderCell={(row, columnId) =>
          renderPropertyCell(
            row,
            columnId,
            propertyAddressMap,
            intlLocale,
            actionLabels,
            setPropertyPendingDelete,
          )
        }
        rows={rowsToRender}
        tableContainerClassName="rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      />

      <PropertyDeleteAlertDialog
        isOpen={propertyPendingDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setPropertyPendingDelete(null);
          }
        }}
        propertyTitle={propertyPendingDelete?.title ?? ""}
      />
    </>
  );
}
