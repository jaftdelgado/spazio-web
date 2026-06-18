"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Building03Icon,
  Delete02Icon,
  DollarCircleIcon,
  Edit03Icon,
  MapsLocation01Icon,
  MoreVerticalIcon,
  RulerIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DataGridRowBase } from "@components/core/DataGrid";
import { ROUTES } from "@/config/routes";
import { saveEditingPropertyUuid } from "@properties/application/edit/property-edit-session";
import type { PropertyCard } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import {
  getModalityLabel,
  getPropertyTypeLabel,
  getStatusLabel,
} from "./propertyListingLabels";
import { PropertyDeleteAlertDialog } from "./PropertyDeleteAlertDialog";
import { usePropertyDeleteFlow } from "./usePropertyDeleteFlow";

type PropertyGridRow = DataGridRowBase & PropertyCard;

type PropertiesGridViewProps = {
  rows: PropertyGridRow[];
  propertyAddressMap: Record<string, string | null>;
};

const chipClassName =
  "inline-flex h-8 items-center rounded-full bg-background px-3 text-[12px] font-medium text-foreground";

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

const getAgentFullName = (agent: PropertyCard["assignedAgent"]) => {
  if (!agent) return "";
  return `${agent.firstName} ${agent.lastName}`.trim();
};

const getAgentInitials = (agent: PropertyCard["assignedAgent"]) => {
  const source = getAgentFullName(agent) || "AG";
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export function PropertiesGridView({
  rows,
  propertyAddressMap,
}: PropertiesGridViewProps) {
  const router = useRouter();
  const { intlLocale, t } = usePropertiesTranslation();
  const {
    propertyPendingDelete,
    setPropertyPendingDelete,
    handleDeleteConfirm,
    isDeletePending,
  } = usePropertyDeleteFlow();

  return (
    <>
      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => (
          <article
            key={row.id}
            className="flex h-full flex-col overflow-hidden rounded-[22px] bg-background"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-[20px] bg-muted/30">
              {row.coverPhotoUrl ? (
                <Image
                  fill
                  alt={row.title}
                  className="object-cover"
                  sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                  src={row.coverPhotoUrl}
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted/35 text-muted-foreground">
                  <HugeiconsIcon
                    icon={Building03Icon}
                    size={32}
                    strokeWidth={1.8}
                  />
                </div>
              )}

              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
                <div className="flex flex-wrap gap-2 pr-3">
                  <span className={chipClassName}>
                    {getPropertyTypeLabel(
                      row.propertyType.propertyTypeId,
                      row.propertyType.name,
                      t,
                    )}
                  </span>
                  <span className={chipClassName}>
                    {getModalityLabel(
                      row.modality.modalityId,
                      row.modality.name,
                      t,
                    )}
                  </span>
                </div>

                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={t("actions.ariaLabel")}
                      className="bg-background/85 text-foreground backdrop-blur"
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
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          ROUTES.admin.propertyDetail(row.propertyUuid),
                        )
                      }
                    >
                      <HugeiconsIcon
                        className="text-muted-foreground"
                        icon={Building03Icon}
                        size={16}
                        strokeWidth={1.8}
                      />
                      <span>{t("actions.view")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        saveEditingPropertyUuid(row.propertyUuid);
                        router.push(ROUTES.admin.propertiesEdit);
                      }}
                    >
                      <HugeiconsIcon
                        className="text-muted-foreground"
                        icon={Edit03Icon}
                        size={16}
                        strokeWidth={1.8}
                      />
                      <span>{t("actions.edit")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setPropertyPendingDelete(row)}
                    >
                      <HugeiconsIcon
                        className="text-destructive"
                        icon={Delete02Icon}
                        size={16}
                        strokeWidth={1.8}
                      />
                      <span>{t("actions.delete")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col px-2.5 pt-2.5 pb-2">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="truncate text-[14px] font-semibold leading-5 text-foreground"
                    title={row.title}
                  >
                    {row.title}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-foreground">
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={12}
                      strokeWidth={1.8}
                    />
                    <span>
                      {getStatusLabel(row.status.statusId, row.status.name, t)}
                    </span>
                  </span>
                </div>

                <p
                  className="flex items-center gap-1.5 truncate text-[12px] text-muted-foreground"
                  title={formatAddress(propertyAddressMap[row.propertyUuid])}
                >
                  <HugeiconsIcon
                    className="shrink-0"
                    icon={MapsLocation01Icon}
                    size={13}
                    strokeWidth={1.8}
                  />
                  <span className="truncate">
                    {formatAddress(propertyAddressMap[row.propertyUuid])}
                  </span>
                </p>
                {row.assignedAgent ? (
                  <div
                    className="flex items-center gap-2 text-[12px] text-muted-foreground"
                    title={getAgentFullName(row.assignedAgent)}
                  >
                    <Avatar className="size-5 border-border/70">
                      {row.assignedAgent.profilePictureUrl ? (
                        <AvatarImage
                          alt={getAgentFullName(row.assignedAgent)}
                          src={row.assignedAgent.profilePictureUrl}
                        />
                      ) : null}
                      <AvatarFallback className="text-[10px]">
                        {getAgentInitials(row.assignedAgent)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {t("grid.agentAssigned", {
                        agent: getAgentFullName(row.assignedAgent),
                      })}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="mt-auto pt-2.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      <HugeiconsIcon
                        icon={RulerIcon}
                        size={13}
                        strokeWidth={1.8}
                      />
                      <span>{t("grid.area")}</span>
                    </p>
                    <p className="text-[13px] font-medium text-foreground">
                      {formatArea(row.builtArea, intlLocale)}
                    </p>
                  </div>

                  <div className="space-y-1 text-right">
                    <p className="flex items-center justify-end gap-1.5 text-[12px] text-muted-foreground">
                      <HugeiconsIcon
                        icon={DollarCircleIcon}
                        size={13}
                        strokeWidth={1.8}
                      />
                      <span>{t("grid.price")}</span>
                    </p>
                    <p className="text-[15px] font-semibold text-foreground">
                      {formatCurrency(row.price, intlLocale)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <PropertyDeleteAlertDialog
        isOpen={propertyPendingDelete !== null}
        isPending={isDeletePending}
        onConfirm={handleDeleteConfirm}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeletePending) {
            setPropertyPendingDelete(null);
          }
        }}
        propertyTitle={propertyPendingDelete?.title ?? ""}
      />
    </>
  );
}
