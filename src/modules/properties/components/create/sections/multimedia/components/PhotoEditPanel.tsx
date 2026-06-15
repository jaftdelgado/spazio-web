"use client";

import {
  Delete02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PhotoEntry } from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PhotoEditPanelProps = {
  entry: PhotoEntry;
  index: number;
  totalPhotos: number;
  onLabelChange: (value: string) => void;
  onAltTextChange: (value: string) => void;
  onSetCover: () => void;
  onRemove: () => void;
};

export function PhotoEditPanel({
  entry,
  onLabelChange,
  onAltTextChange,
  onSetCover,
  onRemove,
}: PhotoEditPanelProps) {
  const { t } = usePropertiesTranslation();

  return (
    <div className="flex items-start gap-4">
      <div className="relative h-[108px] w-[144px] shrink-0 overflow-hidden rounded-2xl">
        <img
          alt={entry.altText || ""}
          className="size-36 rounded-2xl object-cover"
          src={entry.previewUrl}
        />
      </div>
      <div className="flex flex-1 items-start gap-4">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {t("create.multimedia.labelField")}
            </span>
            <Input
              className="h-8 text-sm"
              placeholder={t("create.multimedia.labelPlaceholder")}
              value={entry.label}
              onChange={(event) => onLabelChange(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {t("create.multimedia.altField")}
            </span>
            <Input
              className="h-8 text-sm"
              placeholder={t("create.multimedia.altPlaceholder")}
              value={entry.altText}
              onChange={(event) => onAltTextChange(event.target.value)}
            />
          </div>
        </div>
        <div className="w-36 shrink-0 sm:w-40 md:w-44">
          <div className="flex flex-col items-stretch gap-2">
          {entry.isCover ? (
            <span className="inline-flex h-8 w-full items-center justify-center gap-1 rounded-4xl bg-primary px-3 text-sm text-primary-foreground">
              <HugeiconsIcon
                color="currentColor"
                icon={StarIcon}
                size={12}
                strokeWidth={1.5}
              />
              <span>{t("create.multimedia.coverLabel")}</span>
            </span>
          ) : (
            <Button size="sm" type="button" variant="ghost" onClick={onSetCover}>
              <HugeiconsIcon
                color="currentColor"
                icon={StarIcon}
                size={14}
                strokeWidth={1.5}
              />
              <span>{t("create.multimedia.setCover")}</span>
            </Button>
          )}
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={onRemove}
          >
            <HugeiconsIcon
              color="currentColor"
              icon={Delete02Icon}
              size={14}
              strokeWidth={1.5}
            />
            <span>{t("actions.delete")}</span>
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
