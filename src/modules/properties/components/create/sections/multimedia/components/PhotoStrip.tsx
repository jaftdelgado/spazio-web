"use client";

import type { PhotoEntry } from "@properties/components/create/types";

import { PhotoStripCard } from "./PhotoStripCard";

type PhotoStripProps = {
  entries: PhotoEntry[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
};

export function PhotoStrip({
  entries,
  selectedIndex,
  onSelect,
  onRemove,
}: PhotoStripProps) {
  return (
    <div className="-mx-2 flex gap-3 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {entries.map((entry, index) => (
        <PhotoStripCard
          key={`${entry.file.name}-${entry.previewUrl}-${index}`}
          entry={entry}
          isSelected={index === selectedIndex}
          onClick={() => onSelect(index)}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
}
