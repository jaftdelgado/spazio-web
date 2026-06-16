"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { Service } from "@services/domain/service.entity";
import { useServicesTranslation } from "@services/i18n/useServicesTranslation";

import { resolveServiceIcon } from "./resolveServiceIcon";

export function ServiceTag({
  service,
  mode,
  onToggle,
}: {
  service: Service;
  mode: "selected" | "available";
  onToggle: (serviceId: number) => void;
}) {
  const { tService } = useServicesTranslation();
  const label = tService(service.code);
  const isSelected = mode === "selected";

  return (
    <motion.button
      layout
      aria-pressed={isSelected}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-4xl px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
        isSelected
          ? "bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20"
          : "bg-muted/70 text-foreground hover:bg-muted",
      )}
      transition={{ duration: 0.2, ease: "easeOut" }}
      type="button"
      onClick={() => onToggle(service.serviceId)}
    >
      <HugeiconsIcon
        className="shrink-0"
        icon={resolveServiceIcon(service.icon)}
        size={18}
        strokeWidth={1.8}
      />
      <span>{label}</span>
      {isSelected ? (
        <span className="ml-0.5 text-base leading-none text-primary/75" aria-hidden="true">
          ×
        </span>
      ) : null}
    </motion.button>
  );
}
