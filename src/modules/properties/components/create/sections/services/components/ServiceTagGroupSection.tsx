"use client";

import { AnimatePresence } from "framer-motion";
import type { Service } from "@services/domain/service.entity";

import { ServiceTag } from "./ServiceTag";

export function ServiceTagGroupSection({
  services,
  emptyText,
  mode,
  onServiceAdd,
  onServiceRemove,
}: {
  services: Service[];
  emptyText: string;
  mode: "selected" | "available";
  onServiceAdd: (serviceId: number) => void;
  onServiceRemove: (serviceId: number) => void;
}) {
  const onToggle = mode === "selected" ? onServiceRemove : onServiceAdd;

  return (
    <div className="space-y-2">
      <div className="flex min-h-9 flex-wrap gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {services.length > 0 ? (
            services.map((service) => (
              <ServiceTag
                key={service.serviceId}
                mode={mode}
                service={service}
                onToggle={onToggle}
              />
            ))
          ) : (
            <p className="py-2 text-sm text-muted-foreground">
              {emptyText}
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
