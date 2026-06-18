"use client";

import * as React from "react";

import type { PropertyShowFactItem } from "../../types";
import { PropertyOverviewFacts } from "../PropertyOverviewFacts";
import { PropertyShowSection } from "../common/PropertyShowSection";

type PropertyFactsSectionProps = {
  collapseLabel: string;
  expandLabel: string;
  facts: PropertyShowFactItem[];
  title: string;
};

export function PropertyFactsSection({
  collapseLabel,
  expandLabel,
  facts,
  title,
}: PropertyFactsSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <PropertyShowSection
      title={title}
      action={
        <button
          type="button"
          className="text-sm text-muted-foreground"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? collapseLabel : expandLabel}
        </button>
      }
    >
      {isExpanded ? <PropertyOverviewFacts facts={facts} /> : null}
    </PropertyShowSection>
  );
}
