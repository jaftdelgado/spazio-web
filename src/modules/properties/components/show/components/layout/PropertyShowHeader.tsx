"use client";

import { ArrowLeft01Icon, MapsLocation01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

type PropertyShowHeaderProps = {
  address: string | null;
  canEdit: boolean;
  onBack: () => void;
  onEdit: () => void;
  title: string;
  backLabel: string;
  editLabel: string;
};

export function PropertyShowHeader({
  address,
  canEdit,
  onBack,
  onEdit,
  title,
  backLabel,
  editLabel,
}: PropertyShowHeaderProps) {
  return (
    <header className="space-y-5 pt-(--admin-page-padding-y)">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button className="" size="sm" variant="outline" onClick={onBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.8} />
          <span>{backLabel}</span>
        </Button>

        {canEdit ? (
          <Button className="" size="sm" onClick={onEdit}>
            {editLabel}
          </Button>
        ) : null}
      </div>

      <div className="space-y-3">
        <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {address ? (
            <span className="flex items-center gap-2">
              <HugeiconsIcon
                icon={MapsLocation01Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{address}</span>
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
