"use client";

import { Building03Icon, Home04Icon, RulerIcon, SaleTag02Icon, Sofa01Icon, TaskDone02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getModalityLabel, getPropertyTypeLabel, getStatusLabel } from "@properties/components/listing/propertyListingLabels";
import type { PropertyDetail } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { formatPropertyArea } from "../property-show.helpers";

type PropertySummaryCardProps = {
  intlLocale: string;
  modalityName: string;
  propertyTypeName: string;
  detail: PropertyDetail;
};

export function PropertySummaryCard({
  intlLocale,
  modalityName,
  propertyTypeName,
  detail,
}: PropertySummaryCardProps) {
  const { t } = usePropertiesTranslation();

  const items = [
    {
      icon: Building03Icon,
      label: t("create.fields.title.label"),
      value: detail.title,
    },
    {
      icon: Home04Icon,
      label: t("create.sections.propertyType.label"),
      value: getPropertyTypeLabel(detail.propertyTypeId, propertyTypeName, t),
    },
    {
      icon: SaleTag02Icon,
      label: t("create.sections.modality.label"),
      value: getModalityLabel(detail.modalityId, modalityName, t),
    },
    {
      icon: TaskDone02Icon,
      label: t("columns.status"),
      value: getStatusLabel(detail.statusId, "", t),
    },
    {
      icon: RulerIcon,
      label: t("create.fields.lotArea.label"),
      value: formatPropertyArea(detail.lotArea, intlLocale),
    },
    {
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
    <Card className="rounded-[28px] border-0 bg-background shadow-none ring-1 ring-border/60">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-semibold">
          {t("show.sections.summaryTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-[22px] bg-muted/25 px-4 py-4"
          >
            <div className="flex size-9 items-center justify-center rounded-2xl bg-background text-foreground ring-1 ring-border/60">
              <HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
