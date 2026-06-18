"use client";

import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { SettingsSection } from "@/modules/settings/components/SettingsSection";

type AccountDeleteSectionProps = {
  onDeleteClick: () => void;
  t: (key: string) => string;
};

export function AccountDeleteSection({
  onDeleteClick,
  t,
}: AccountDeleteSectionProps) {
  return (
    <SettingsSection title={t("profile.delete.title")} hint={t("profile.delete.hint")}>
      <div className="rounded-3xl bg-card px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-foreground">
              {t("profile.delete.cardTitle")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t("profile.delete.cardDescription")}
            </p>
          </div>

          <Button type="button" variant="destructive" onClick={onDeleteClick}>
            <HugeiconsIcon icon={Delete02Icon} size={16} />
            {t("profile.delete.submit")}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
