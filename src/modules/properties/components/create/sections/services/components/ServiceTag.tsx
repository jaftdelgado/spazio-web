"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Tag } from "@heroui/react";
import { motion } from "framer-motion";

import type { Service } from "@services/domain/service.entity";
import { useServicesTranslation } from "@services/i18n/useServicesTranslation";

import { resolveServiceIcon } from "./resolveServiceIcon";

export function ServiceTag({ service }: { service: Service }) {
  const { tService } = useServicesTranslation();
  const label = tService(service.code);

  return (
    <Tag id={String(service.serviceId)} textValue={label}>
      <motion.span
        layout
        className="inline-flex items-center gap-2"
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <HugeiconsIcon
          icon={resolveServiceIcon(service.icon)}
          size={18}
          strokeWidth={1.8}
        />
        {label}
      </motion.span>
    </Tag>
  );
}
