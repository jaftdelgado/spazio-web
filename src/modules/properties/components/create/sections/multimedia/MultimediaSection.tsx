"use client";

import * as React from "react";

import { CreateFormSection } from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PhotoEntry,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { PhotoDropzone } from "./components/PhotoDropzone";
import { PhotoEditPanel } from "./components/PhotoEditPanel";
import { PhotoStrip } from "./components/PhotoStrip";

export const MAX_PHOTOS = 10;
export const MIN_PHOTOS = 1;
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const ALLOWED_EXTENSIONS_LABEL = "JPG, PNG, WEBP";
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function resolveRejectedMessage(
  t: ReturnType<typeof usePropertiesTranslation>["t"],
  rejectedByType: boolean,
  rejectedBySize: boolean,
  rejectedByMax: boolean,
) {
  if (rejectedByType) {
    return t("create.multimedia.errorType");
  }

  if (rejectedBySize) {
    return t("create.multimedia.errorSize", { maxMb: MAX_FILE_SIZE_MB });
  }

  if (rejectedByMax) {
    return t("create.multimedia.errorMax", { max: MAX_PHOTOS });
  }

  return null;
}

function ensureSingleCover(entries: PhotoEntry[]) {
  if (entries.length === 0) {
    return entries;
  }

  const coverIndex = entries.findIndex((entry) => entry.isCover);
  const resolvedCoverIndex = coverIndex >= 0 ? coverIndex : 0;

  return entries.map((entry, index) => ({
    ...entry,
    isCover: index === resolvedCoverIndex,
  }));
}

export function MultimediaSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();
  const [dropError, setDropError] = React.useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (form.photos.length === 0) {
      setSelectedIndex(0);
      return;
    }

    if (selectedIndex >= form.photos.length) {
      setSelectedIndex(form.photos.length - 1);
    }
  }, [form.photos.length, selectedIndex]);

  const handleFilesAdded = (files: File[]) => {
    let rejectedByType = false;
    let rejectedBySize = false;
    let rejectedByMax = false;

    const currentPhotos = form.photos;
    let remainingSlots = MAX_PHOTOS - currentPhotos.length;
    const firstNewIndex = currentPhotos.length;

    const nextEntries = files.reduce<PhotoEntry[]>((accepted, file) => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        rejectedByType = true;
        return accepted;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedBySize = true;
        return accepted;
      }

      if (remainingSlots <= 0) {
        rejectedByMax = true;
        return accepted;
      }

      remainingSlots -= 1;

      accepted.push({
        file,
        previewUrl: URL.createObjectURL(file),
        label: "",
        altText: "",
        isCover: firstNewIndex === 0 && accepted.length === 0,
      });

      return accepted;
    }, []);

    if (nextEntries.length > 0) {
      patchForm({ photos: [...currentPhotos, ...nextEntries] });
      setSelectedIndex(firstNewIndex);
    }

    setDropError(
      resolveRejectedMessage(t, rejectedByType, rejectedBySize, rejectedByMax),
    );
  };

  const handleRemove = (index: number) => {
    const removed = form.photos[index];

    if (!removed) return;

    URL.revokeObjectURL(removed.previewUrl);

    const next = form.photos.filter((_, currentIndex) => currentIndex !== index);
    patchForm({ photos: removed.isCover ? ensureSingleCover(next) : next });

    setSelectedIndex((current) =>
      Math.max(0, index <= current ? current - 1 : current),
    );
    setDropError(null);
  };

  const handleSetCover = (index: number) => {
    patchForm({
      photos: form.photos.map((entry, currentIndex) => ({
        ...entry,
        isCover: currentIndex === index,
      })),
    });
  };

  const handleLabelChange = (value: string) => {
    patchForm({
      photos: form.photos.map((entry, currentIndex) =>
        currentIndex === selectedIndex ? { ...entry, label: value } : entry,
      ),
    });
  };

  const handleAltTextChange = (value: string) => {
    patchForm({
      photos: form.photos.map((entry, currentIndex) =>
        currentIndex === selectedIndex ? { ...entry, altText: value } : entry,
      ),
    });
  };

  const selectedEntry = form.photos[selectedIndex] ?? null;

  return (
    <CreateFormSection
      hint={t("create.sections.multimedia.hint")}
      title={t("create.sections.multimedia.title")}
    >
      <div className="flex flex-col gap-6">
        <PhotoDropzone
          error={dropError ?? undefined}
          photoCount={form.photos.length}
          onFilesAdded={handleFilesAdded}
        />
        {selectedEntry ? (
          <PhotoEditPanel
            entry={selectedEntry}
            index={selectedIndex}
            totalPhotos={form.photos.length}
            onAltTextChange={handleAltTextChange}
            onLabelChange={handleLabelChange}
            onRemove={() => handleRemove(selectedIndex)}
            onSetCover={() => handleSetCover(selectedIndex)}
          />
        ) : null}
        {form.photos.length > 0 ? (
          <PhotoStrip
            entries={form.photos}
            selectedIndex={selectedIndex}
            onRemove={handleRemove}
            onSelect={setSelectedIndex}
          />
        ) : null}
      </div>
    </CreateFormSection>
  );
}
