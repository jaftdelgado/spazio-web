"use client";

import { HugeiconsIcon } from "@hugeicons/react";

import { Card, CardContent } from "@/components/ui/card";
import { resolveServiceIcon } from "@properties/components/create/sections/services/components/resolveServiceIcon";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import type { Service } from "@services/domain/service.entity";
import { useServicesTranslation } from "@services/i18n/useServicesTranslation";

type PropertyServicesListProps = {
  isLoading: boolean;
  services: Service[];
};

export function PropertyServicesList({
  isLoading,
  services,
}: PropertyServicesListProps) {
  const { t } = usePropertiesTranslation();
  const { tService } = useServicesTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[88px] animate-pulse rounded-[24px] bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <Card className="rounded-[28px] border-0 bg-muted/25 shadow-none ring-0">
        <CardContent className="py-6 text-sm text-muted-foreground">
          {t("show.servicesEmpty")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <div
          key={service.serviceId}
          className="flex items-center gap-3 rounded-[24px] bg-background px-4 py-4 ring-1 ring-border/60"
        >
          <div className="flex size-10 items-center justify-center rounded-2xl bg-muted/40 text-foreground">
            <HugeiconsIcon
              icon={resolveServiceIcon(service.icon)}
              size={18}
              strokeWidth={1.8}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {tService(service.code)}
            </p>
            <p className="text-xs text-muted-foreground">{service.categoryCode}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
