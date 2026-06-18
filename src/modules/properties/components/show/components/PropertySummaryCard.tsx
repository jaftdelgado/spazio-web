"use client";

import {
  Building03Icon,
  Home04Icon,
  RulerIcon,
  SaleTag02Icon,
  Sofa01Icon,
  TaskDone02Icon,
  UserIcon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getModalityLabel,
  getPropertyTypeLabel,
  getStatusLabel,
} from "@properties/components/listing/propertyListingLabels";
import type { PropertyDetail } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { formatPropertyArea } from "../property-show.helpers";

type PropertySummaryCardProps = {
  intlLocale: string;
  modalityName: string;
  propertyTypeName: string;
  detail: PropertyDetail;
  registeredByName: string | null;
};

type SummaryItem = {
  key: string;
  icon: IconSvgElement;
  label: string;
  value: string;
};

export function PropertySummaryCard({
  intlLocale,
  modalityName,
  propertyTypeName,
  detail,
  registeredByName,
}: PropertySummaryCardProps) {
  const { t } = usePropertiesTranslation();
  const assignedAgentName = detail.assignedAgent
    ? `${detail.assignedAgent.firstName} ${detail.assignedAgent.lastName}`.trim()
    : null;
  const assignedAgentInitials = assignedAgentName
    ? assignedAgentName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "AG";

  const items: SummaryItem[] = [
    {
      key: "title",
      icon: Building03Icon,
      label: t("create.fields.title.label"),
      value: detail.title,
    },
    ...(registeredByName
      ? [
          {
            key: "registeredBy",
            icon: UserIcon,
            label: t("show.summary.registeredByLabel"),
            value: registeredByName,
          },
        ]
      : []),
    ...(assignedAgentName
      ? [
          {
            key: "assignedAgent",
            icon: UserAccountIcon,
            label: t("show.summary.assignedAgentLabel"),
            value: assignedAgentName,
          },
        ]
      : []),
    {
      key: "propertyType",
      icon: Home04Icon,
      label: t("create.sections.propertyType.label"),
      value: getPropertyTypeLabel(detail.propertyTypeId, propertyTypeName, t),
    },
    {
      key: "modality",
      icon: SaleTag02Icon,
      label: t("create.sections.modality.label"),
      value: getModalityLabel(detail.modalityId, modalityName, t),
    },
    {
      key: "status",
      icon: TaskDone02Icon,
      label: t("columns.status"),
      value: getStatusLabel(detail.statusId, "", t),
    },
    {
      key: "lotArea",
      icon: RulerIcon,
      label: t("create.fields.lotArea.label"),
      value: formatPropertyArea(detail.lotArea, intlLocale),
    },
    {
      key: "isFurnished",
      icon: Sofa01Icon,
      label: t("create.fields.isFurnished.label"),
      value: detail.residential
        ? detail.residential.isFurnished
          ? t("show.values.yes")
          : t("show.values.no")
        : t("show.values.notAvailable"),
    },
  ];

  return (
    <Card className="rounded-[28px] bg-card/60 shadow-border">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-semibold">
          {t("show.sections.summaryTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-none border-y border-border/60 bg-transparent">
          {items.map((item) => (
            <div
              key={item.key}
              className="grid grid-cols-[28px_minmax(0,1fr)] items-start gap-3 border-b border-border py-4 last:border-b-0"
            >
              <div className="flex size-7 items-center justify-center text-foreground">
                <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="m-0 text-[15px] font-normal leading-[1.4] text-foreground">
                  {item.label}
                </p>
                {item.key === "assignedAgent" && detail.assignedAgent ? (
                  <div className="mt-1 flex items-center gap-3">
                    <Avatar className="size-6 border-border/70">
                      {detail.assignedAgent.profilePictureUrl ? (
                        <AvatarImage
                          alt={assignedAgentName ?? ""}
                          src={detail.assignedAgent.profilePictureUrl}
                        />
                      ) : null}
                      <AvatarFallback className="text-[10px] items-center justify-center">
                        {assignedAgentInitials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[15px] leading-[1.4] text-muted-foreground">
                      {item.value}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1 text-[15px] leading-[1.4] text-muted-foreground">
                    {item.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
