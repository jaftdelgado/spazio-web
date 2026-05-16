"use client";

import Image from "next/image";

import {
  Building03Icon,
  MapsLocation01Icon,
  RulerIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, Chip } from "@heroui/react";

import type { DataGridRowBase } from "@components/core/DataGrid";
import type { PropertyCard } from "@properties/domain/property.entity";

type PropertyGridRow = DataGridRowBase & PropertyCard;

type PropertiesGridViewProps = {
  rows: PropertyGridRow[];
  totalCount: number;
  propertyAddressMap: Record<string, string | null>;
};

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

export function PropertiesGridView({
  rows,
  totalCount,
  propertyAddressMap,
}: PropertiesGridViewProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">
        Mostrando {rows.length} de {totalCount} propiedades
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <Card key={row.id} className="overflow-hidden">
            {row.coverPhotoUrl ? (
              <div className="relative h-48 w-full">
                <Image
                  fill
                  alt={row.title}
                  className="object-cover"
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={row.coverPhotoUrl}
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-400">
                <HugeiconsIcon
                  icon={Building03Icon}
                  size={32}
                  strokeWidth={1.8}
                />
              </div>
            )}

            <Card.Header className="gap-2">
              <Card.Title>{row.title}</Card.Title>
              <Card.Description className="flex items-start gap-2">
                <HugeiconsIcon
                  className="mt-0.5 shrink-0"
                  icon={MapsLocation01Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>{formatAddress(propertyAddressMap[row.propertyUuid])}</span>
              </Card.Description>
            </Card.Header>

            <Card.Content className="gap-4">
              <div className="flex flex-wrap gap-2">
                <Chip color="accent" size="sm" variant="secondary">
                  <Chip.Label>{row.propertyType.name}</Chip.Label>
                </Chip>
                <Chip color="accent" size="sm" variant="secondary">
                  <Chip.Label>{row.modality.name}</Chip.Label>
                </Chip>
                <Chip color="accent" size="sm" variant="secondary">
                  <Chip.Label>{row.status.name}</Chip.Label>
                </Chip>
              </div>
            </Card.Content>

            <Card.Footer className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Precio</p>
                <p className="font-medium text-slate-950">
                  {formatCurrency(row.price)}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-slate-500">
                  <HugeiconsIcon icon={RulerIcon} size={14} strokeWidth={1.8} />
                  <span>Area</span>
                </p>
                <p className="font-medium text-slate-950">
                  {formatArea(row.builtArea)}
                </p>
              </div>
            </Card.Footer>
          </Card>
        ))}
      </div>
    </div>
  );
}
