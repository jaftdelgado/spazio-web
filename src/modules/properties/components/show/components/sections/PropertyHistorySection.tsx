"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { PropertyStatusHistory } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { PropertyShowSection } from "../common/PropertyShowSection";

type PropertyHistorySectionProps = {
  history: PropertyStatusHistory[];
  isLoading: boolean;
  locale: string;
};

function formatHistoryDate(
  value: string,
  locale: string,
  unavailableDateText: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return unavailableDateText;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function resolveStatusLabel(
  statusName: string | null | undefined,
  fallback: string,
  t: (key: string) => string,
) {
  const normalizedStatus = statusName?.trim().toLowerCase();

  if (!normalizedStatus) {
    return fallback;
  }

  const statusKeyByName: Record<string, string> = {
    available: "available",
    disponible: "available",
    reserved: "reserved",
    reservada: "reserved",
    reservado: "reserved",
    sold: "sold",
    vendida: "sold",
    vendido: "sold",
    rented: "rented",
    rentada: "rented",
    rentado: "rented",
    deleted: "deleted",
    eliminada: "deleted",
    eliminado: "deleted",
  };

  const statusKey = statusKeyByName[normalizedStatus];

  if (!statusKey) {
    return statusName ?? fallback;
  }

  return t(`listing.statuses.${statusKey}`);
}

function getStatusTransition(
  item: PropertyStatusHistory,
  t: (key: string) => string,
) {
  const previousStatus = resolveStatusLabel(
    item.previousStatusName,
    t("show.history.unknownPreviousStatus"),
    t,
  );

  const newStatus = resolveStatusLabel(
    item.newStatusName,
    t("show.history.unknownStatus"),
    t,
  );

  return `${previousStatus} → ${newStatus}`;
}

export function PropertyHistorySection({
  history,
  isLoading,
  locale,
}: PropertyHistorySectionProps) {
  const { t } = usePropertiesTranslation();

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );

  return (
    <PropertyShowSection title={t("show.sections.historyTitle")}>
      {isLoading ? (
        <Card className="rounded-[28px] border-0 bg-muted/25 shadow-none ring-0">
          <CardContent className="py-6 text-sm text-muted-foreground">
            {t("show.history.loading")}
          </CardContent>
        </Card>
      ) : sortedHistory.length > 0 ? (
        <div className="rounded-[28px] border bg-card px-5 py-5">
          <ol className="space-y-5">
            {sortedHistory.map((item, index) => (
              <li key={item.historyId} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
                    {sortedHistory.length - index}
                  </span>

                  {index < sortedHistory.length - 1 ? (
                    <span className="mt-2 h-full min-h-10 w-px bg-border" />
                  ) : null}
                </div>

                <div className="flex-1 rounded-3xl border bg-background px-4 py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("show.history.statusChange")}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {getStatusTransition(item, t)}
                      </p>
                    </div>

                    <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
                      {formatHistoryDate(
                        item.changedAt,
                        locale,
                        t("show.history.unavailableDate"),
                      )}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    {t("show.history.changedBy")}{" "}
                    <span className="font-medium text-foreground">
                      {item.changedByName || t("show.history.unknownUser")}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <Card className="rounded-[28px] border-0 bg-muted/25 shadow-none ring-0">
          <CardContent className="py-6 text-sm text-muted-foreground">
            {t("show.history.empty")}
          </CardContent>
        </Card>
      )}
    </PropertyShowSection>
  );
}