"use client";

import type { ReactNode } from "react";

import { SectionHeader } from "@/components/ui/section-header";

type PropertyShowSectionProps = {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
};

export function PropertyShowSection({
  title,
  action,
  children,
}: PropertyShowSectionProps) {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <SectionHeader
          className="mb-0"
          title={title}
          titleClassName="text-2xl font-semibold"
        />
        {action}
      </div>
      {children}
    </section>
  );
}
