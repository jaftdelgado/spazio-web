"use client";

import type { ReactNode } from "react";
import { Globe02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type PreferenceCardProps = {
  children: ReactNode;
  description: string;
  icon: typeof Globe02Icon;
  title: string;
};

export function PreferenceCard({
  children,
  description,
  icon,
  title,
}: PreferenceCardProps) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-3xl border bg-card px-4 py-4">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <HugeiconsIcon icon={icon} size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}
