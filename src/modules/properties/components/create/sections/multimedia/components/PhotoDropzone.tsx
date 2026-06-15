"use client";

import * as React from "react";
import { Upload01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import {
  ALLOWED_EXTENSIONS_LABEL,
  MAX_FILE_SIZE_MB,
  MAX_PHOTOS,
} from "../MultimediaSection";

type PhotoDropzoneProps = {
  photoCount: number;
  onFilesAdded: (files: File[]) => void;
  error?: string;
};

export function PhotoDropzone({
  photoCount,
  onFilesAdded,
  error,
}: PhotoDropzoneProps) {
  const { t } = usePropertiesTranslation();
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isDisabled = photoCount >= MAX_PHOTOS;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || isDisabled) return;

    onFilesAdded(Array.from(fileList));
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          "flex items-center justify-between gap-4 rounded-2xl border border-dashed border-border px-4 py-3 text-left transition-colors",
          isDisabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
          isDragging && !isDisabled && "border-ring bg-muted/40",
        )}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        onClick={() => {
          if (!isDisabled) {
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!isDisabled) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) {
            setIsDragging(false);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isDisabled) setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        onKeyDown={(event) => {
          if (isDisabled) return;

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">
            <HugeiconsIcon
              color="currentColor"
              icon={Upload01Icon}
              size={20}
              strokeWidth={1.5}
            />
          </span>
          <div className="flex flex-col">
            <p className="text-sm font-medium text-foreground">
              {isDisabled
                ? t("create.multimedia.maxReached")
                : t("create.multimedia.dropzoneTitle")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("create.multimedia.dropzoneHint", {
                extensions: ALLOWED_EXTENSIONS_LABEL,
                maxMb: MAX_FILE_SIZE_MB,
              })}
            </p>
          </div>
        </div>
        <input
          hidden
          ref={inputRef}
          accept="image/jpeg,image/png,image/webp"
          multiple
          type="file"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
