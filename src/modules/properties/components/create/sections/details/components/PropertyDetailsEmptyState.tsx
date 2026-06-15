"use client";

import {
  Building03Icon,
  Home01Icon,
  Store04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

export function PropertyDetailsEmptyState({
  mode,
}: {
  mode: "other" | "unselected";
}) {
  const { t } = usePropertiesTranslation();

  if (mode === "other") {
    return (
      <Empty className="min-h-40 rounded-3xl border border-dashed border-border bg-card px-6 py-8">
        <EmptyHeader>
          <EmptyMedia className="bg-primary/10 text-primary" variant="icon">
            <HugeiconsIcon icon={Building03Icon} size={22} strokeWidth={1.8} />
          </EmptyMedia>
          <EmptyTitle>{t("create.details.other.title")}</EmptyTitle>
          <EmptyDescription className="max-w-lg">
            {t("create.details.other.description")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty className="min-h-40 rounded-3xl border border-dashed border-border bg-card px-6 py-8">
      <EmptyHeader>
        <EmptyMedia variant="default">
          <div className="flex items-center gap-3 text-primary">
            <span className="rounded-2xl bg-primary/10 p-3">
              <HugeiconsIcon icon={Home01Icon} size={20} strokeWidth={1.8} />
            </span>
            <span className="rounded-2xl bg-primary/10 p-3">
              <HugeiconsIcon icon={Store04Icon} size={20} strokeWidth={1.8} />
            </span>
          </div>
        </EmptyMedia>
        <EmptyTitle>{t("create.details.unselected.title")}</EmptyTitle>
        <EmptyDescription className="max-w-lg">
          {t("create.details.unselected.description")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
