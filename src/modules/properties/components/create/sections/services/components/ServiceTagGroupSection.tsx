"use client";

import type { Selection } from "@heroui/react";

import { AnimatePresence } from "framer-motion";
import { Description, EmptyState, Label, TagGroup } from "@heroui/react";
import * as React from "react";

import type { Service } from "@services/domain/service.entity";

import { ServiceTag } from "./ServiceTag";

export function ServiceTagGroupSection({
  title,
  hint,
  services,
  emptyText,
  mode,
  onServiceAdd,
  onServiceRemove,
}: {
  title: string;
  hint: string;
  services: Service[];
  emptyText: string;
  mode: "selected" | "available";
  onServiceAdd: (serviceId: number) => void;
  onServiceRemove: (serviceId: number) => void;
}) {
  const selectedKeys = React.useMemo<Selection>(
    () =>
      mode === "selected"
        ? new Set(services.map((service) => String(service.serviceId)))
        : new Set(),
    [mode, services],
  );

  const lastSelectedKeysRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (selectedKeys !== "all") {
      lastSelectedKeysRef.current = new Set(
        Array.from(selectedKeys).filter(
          (key): key is string => typeof key === "string",
        ),
      );
    }
  }, [selectedKeys]);

  return (
    <TagGroup
      selectedKeys={selectedKeys}
      selectionMode={mode === "selected" ? "multiple" : "single"}
      size="md"
      variant="surface"
      onSelectionChange={(keys) => {
        if (keys === "all") {
          return;
        }

        if (mode === "selected") {
          const previousKeys = lastSelectedKeysRef.current;

          for (const previousKey of previousKeys) {
            if (!keys.has(previousKey) && typeof previousKey === "string") {
              onServiceRemove(Number(previousKey));
              break;
            }
          }

          return;
        }

        const firstKey = Array.from(keys)[0];

        if (typeof firstKey === "string") {
          onServiceAdd(Number(firstKey));
        }
      }}
    >
      <Label>{title}</Label>
      <TagGroup.List
        className="gap-2"
        renderEmptyState={() => <EmptyState className="p-1">{emptyText}</EmptyState>}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {services.map((service) => (
            <ServiceTag key={service.serviceId} service={service} />
          ))}
        </AnimatePresence>
      </TagGroup.List>
      <Description>{hint}</Description>
    </TagGroup>
  );
}
