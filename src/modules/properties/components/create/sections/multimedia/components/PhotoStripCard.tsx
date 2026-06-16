"use client";

import * as React from "react";
import {
  Cancel01Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import type { PhotoEntry } from "@properties/components/create/types";

type PhotoStripCardProps = {
  entry: PhotoEntry;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (event: React.MouseEvent) => void;
};

export function PhotoStripCard({
  entry,
  isSelected,
  onClick,
  onRemove,
}: PhotoStripCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-opacity",
        isSelected ? "ring-2 ring-primary ring-offset-2" : "opacity-80 hover:opacity-100",
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <img
        alt={entry.altText || ""}
        className="size-full object-cover"
        src={entry.previewUrl}
      />
      <button
        className="absolute top-1.5 right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove(event);
        }}
      >
        <HugeiconsIcon
          color="currentColor"
          icon={Cancel01Icon}
          size={10}
          strokeWidth={1.5}
        />
      </button>
      {entry.isCover ? (
        <span className="absolute bottom-1.5 left-1.5 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-primary-foreground">
          <HugeiconsIcon
            color="currentColor"
            icon={StarIcon}
            size={10}
            strokeWidth={1.5}
          />
        </span>
      ) : null}
      {entry.altText.trim() !== "" ? (
        <span className="absolute right-1.5 bottom-1.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[9px] font-medium text-foreground">
          ALT
        </span>
      ) : null}
    </div>
  );
}
