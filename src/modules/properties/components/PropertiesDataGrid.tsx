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
import { Button, Dropdown, Label, Chip } from "@heroui/react";

import {
  DataGrid,
  type DataGridColumn,
  type DataGridRowBase,
} from "@components/core/DataGrid";
import type { PropertyCard } from "@properties/domain/property.entity";
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

const columnLabel = (
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"],
  label: string,
) => (
  <span className="flex items-center gap-2 text-muted">
    <HugeiconsIcon className="h-4 w-4 shrink-0 text-muted" icon={icon} />
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
  },
  {
    id: "builtArea",
    label: columnLabel(RulerIcon, "Area"),
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
  onDeletePress: (row: PropertyGridRow) => void,
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
      return <span className="tabular-nums">{formatCurrency(row.price)}</span>;
    case "builtArea":
      return <span className="tabular-nums">{formatArea(row.builtArea)}</span>;
    case "actions":
      return (
        <Dropdown>
          <Button isIconOnly aria-label="Acciones" size="sm" variant="ghost">
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
              <Dropdown.Item id="view" textValue="Consultar detalles">
                <HugeiconsIcon
                  className="size-4 shrink-0 text-slate-500"
                  icon={Building03Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <Label>Consultar detalles</Label>
              </Dropdown.Item>
              <Dropdown.Item id="edit" textValue="Modificar">
                <HugeiconsIcon
                  className="size-4 shrink-0 text-slate-500"
                  icon={Edit03Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <Label>Modificar</Label>
              </Dropdown.Item>
              <Dropdown.Item
                id="delete"
                textValue="Eliminar"
                variant="danger"
                onAction={() => onDeletePress(row)}
              >
                <HugeiconsIcon
                  className="size-4 shrink-0 text-danger"
                  icon={Delete02Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <Label>Eliminar</Label>
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
};

export function PropertiesDataGrid({
  rows,
  propertyAddressMap,
}: PropertiesDataGridProps) {
  const [propertyPendingDelete, setPropertyPendingDelete] =
    React.useState<PropertyGridRow | null>(null);

  return (
    <>
      <DataGrid<PropertyGridRow, PropertyGridColumnId>
        columns={PROPERTY_COLUMNS}
        fillAvailableHeight
        getRowLabel={(row) => row.title}
        renderCell={(row, columnId) =>
          renderPropertyCell(
            row,
            columnId,
            propertyAddressMap,
            setPropertyPendingDelete,
          )
        }
        rows={rows}
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
