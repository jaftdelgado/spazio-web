"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DataGrid,
  type DataGridColumn,
  type DataGridRowBase,
} from "@components/core/DataGrid";
import { saveEditingPropertyUuid } from "@properties/application/edit/property-edit-session";
import type { PropertyCard } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import {
  getModalityLabel,
  getPropertyTypeLabel,
  getStatusLabel,
} from "./propertyListingLabels";
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
const chipClassName =
  "inline-flex rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 text-xs font-medium text-muted-foreground";

const columnLabel = (
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"],
  label: string,
) => (
  <span className="flex items-center gap-2 text-muted-foreground">
    <HugeiconsIcon className="h-4 w-4 shrink-0" icon={icon} />
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
      return <Skeleton className="h-4 w-40 rounded-full" />;
    case "propertyType":
    case "modality":
    case "status":
      return <Skeleton className="h-6 w-24 rounded-full" />;
    case "address":
      return <Skeleton className="h-4 w-52 rounded-full" />;
    case "price":
      return <Skeleton className="ml-auto h-4 w-28 rounded-full" />;
    case "builtArea":
      return <Skeleton className="ml-auto h-4 w-16 rounded-full" />;
    case "actions":
      return <Skeleton className="ml-auto h-8 w-8 rounded-2xl" />;
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
  t: ReturnType<typeof usePropertiesTranslation>["t"],
  onEditPress: (row: PropertyGridRow) => void,
  onDeletePress: (row: PropertyGridRow) => void,
) {
  if (isLoadingRow(row)) {
    return renderLoadingCell(columnId);
  }

  switch (columnId) {
    case "title":
      return (
        <div className="truncate font-medium text-foreground" title={row.title}>
          {row.title}
        </div>
      );
    case "propertyType":
      return (
        <span className={chipClassName}>
          {getPropertyTypeLabel(row.propertyType.propertyTypeId, row.propertyType.name, t)}
        </span>
      );
    case "address":
      return (
        <span
          className="block truncate text-muted-foreground"
          title={formatAddress(propertyAddressMap[row.propertyUuid])}
        >
          {formatAddress(propertyAddressMap[row.propertyUuid])}
        </span>
      );
    case "modality":
      return (
        <span className={chipClassName}>
          {getModalityLabel(row.modality.modalityId, row.modality.name, t)}
        </span>
      );
    case "status":
      return (
        <span className={chipClassName}>
          {getStatusLabel(row.status.statusId, row.status.name, t)}
        </span>
      );
    case "price":
      return (
        <span className="tabular-nums text-foreground">
          {formatCurrency(row.price, locale)}
        </span>
      );
    case "builtArea":
      return (
        <span className="tabular-nums text-foreground">
          {formatArea(row.builtArea, locale)}
        </span>
      );
    case "actions":
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={labels.actionsAriaLabel}
              className="rounded-2xl"
              size="icon-sm"
              variant="ghost"
            >
              <HugeiconsIcon
                icon={MoreVerticalIcon}
                size={18}
                strokeWidth={1.8}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={Building03Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{labels.view}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditPress(row)}>
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={Edit03Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{labels.edit}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeletePress(row)}
            >
              <HugeiconsIcon
                className="text-destructive"
                icon={Delete02Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{labels.delete}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
  const router = useRouter();
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
            t,
            (row) => {
              saveEditingPropertyUuid(row.propertyUuid);
              router.push(ROUTES.admin.propertiesEdit);
            },
            setPropertyPendingDelete,
          )
        }
        rows={rowsToRender}
        tableContainerClassName="rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
