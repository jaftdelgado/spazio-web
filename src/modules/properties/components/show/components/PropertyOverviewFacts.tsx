"use client";

import { HugeiconsIcon } from "@hugeicons/react";

import type { PropertyShowFactItem } from "../types";

type PropertyOverviewFactsProps = {
  facts: PropertyShowFactItem[];
};

export function PropertyOverviewFacts({ facts }: PropertyOverviewFactsProps) {
  return (
    <section className="overflow-hidden rounded-none border-y border-border bg-transparent">
      {facts.map((fact) => (
        <div
          key={fact.key}
          className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 py-4 last:border-b-0"
        >
          <div className="flex size-7 items-center justify-center text-foreground">
            <HugeiconsIcon icon={fact.icon} size={20} strokeWidth={1.8} />
          </div>
          <p className="m-0 text-[15px] font-normal leading-[1.4] text-foreground">
            {fact.label}
          </p>
          <p className="m-0 text-right text-[15px] font-normal leading-[1.4] text-muted-foreground">
            {fact.value}
          </p>
        </div>
      ))}
    </section>
  );
}
