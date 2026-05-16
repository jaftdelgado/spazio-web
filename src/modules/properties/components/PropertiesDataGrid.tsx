"use client";

import * as React from "react";

import {
  Building03Icon,
  DollarCircleIcon,
  Home07Icon,
  MapsLocation01Icon,
  NoteIcon,
  RulerIcon,
  TaskDone02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Chip } from "@heroui/react";

import {
  DataGrid,
  type DataGridColumn,
  type DataGridRowBase,
} from "@components/core/DataGrid";
import type { PropertyCard } from "@properties/domain/property.entity";

type PropertyGridColumnId =
  | "title"
  | "propertyType"
  | "address"
  | "modality"
  | "status"
  | "price"
  | "builtArea";

type PropertyGridRow = DataGridRowBase & PropertyCard;

const columnLabel = (
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"],
  label: string,
) => (
  <span className="flex items-center gap-2">
    <HugeiconsIcon className="h-4 w-4 text-slate-500" icon={icon} />
    <span>{label}</span>
  </span>
);

const PROPERTY_COLUMNS: DataGridColumn<PropertyGridColumnId>[] = [
  {
    id: "title",
    label: columnLabel(Home07Icon, "Propiedad"),
    width: 280,
    minWidth: 220,
  },
  {
    id: "propertyType",
    label: columnLabel(Building03Icon, "Tipo"),
    width: 160,
    minWidth: 140,
  },
  {
    id: "address",
    label: columnLabel(MapsLocation01Icon, "Direccion"),
    width: 300,
    minWidth: 220,
  },
  {
    id: "modality",
    label: columnLabel(NoteIcon, "Modalidad"),
    width: 150,
    minWidth: 130,
  },
  {
    id: "status",
    label: columnLabel(TaskDone02Icon, "Estado"),
    width: 150,
    minWidth: 130,
  },
  {
    id: "price",
    label: columnLabel(DollarCircleIcon, "Precio"),
    width: 180,
    minWidth: 160,
    align: "right",
  },
  {
    id: "builtArea",
    label: columnLabel(RulerIcon, "Area"),
    width: 130,
    minWidth: 110,
    align: "right",
  },
];

const formatCurrency = (price: PropertyCard["price"]) => {
  if (!price) return "-";

  const formattedAmount = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount);

  if (price.periodName) {
    return `${formattedAmount} / ${price.periodName}`;
  }

  return formattedAmount;
};

const formatArea = (value: number | null) => {
  if (value === null) return "-";
  return `${new Intl.NumberFormat("es-MX").format(value)} m2`;
};

const formatAddress = (address: string | null | undefined) => {
  return address && address.trim().length > 0 ? address : "-";
};

function renderPropertyCell(
  row: PropertyGridRow,
  columnId: PropertyGridColumnId,
  propertyAddressMap: Record<string, string | null>,
) {
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
      return formatCurrency(row.price);
    case "builtArea":
      return formatArea(row.builtArea);
    default:
      return null;
  }
}

type PropertiesDataGridProps = {
  rows: PropertyGridRow[];
  totalCount: number;
  propertyAddressMap: Record<string, string | null>;
};

export function PropertiesDataGrid({
  rows,
  totalCount,
  propertyAddressMap,
}: PropertiesDataGridProps) {
  return (
    <DataGrid<PropertyGridRow, PropertyGridColumnId>
      columns={PROPERTY_COLUMNS}
      getRowLabel={(row) => row.title}
      renderCell={(row, columnId) =>
        renderPropertyCell(row, columnId, propertyAddressMap)
      }
      renderToolbar={({ visibleRowCount }) => (
        <div className="mb-4 text-sm text-slate-600">
          Mostrando {visibleRowCount} de{" "}
          {totalCount} propiedades
        </div>
      )}
      rows={rows}
      tableContainerClassName="rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    />
  );
}
