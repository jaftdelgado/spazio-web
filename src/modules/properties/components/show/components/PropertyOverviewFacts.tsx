"use client";

import { HugeiconsIcon } from "@hugeicons/react";

import type { PropertyShowFactItem } from "../types";

type PropertyOverviewFactsProps = {
  facts: PropertyShowFactItem[];
};

export function PropertyOverviewFacts({ facts }: PropertyOverviewFactsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.key} className="rounded-[24px] bg-muted/35 px-4 py-4">
          <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-background text-foreground ring-1 ring-border/60">
            <HugeiconsIcon icon={fact.icon} size={18} strokeWidth={1.8} />
          </div>
          <p className="text-xs text-muted-foreground">{fact.label}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{fact.value}</p>
        </div>
      ))}
    </section>
  );
}
