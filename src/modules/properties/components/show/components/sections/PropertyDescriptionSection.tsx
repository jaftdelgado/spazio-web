"use client";

import { PropertyShowSection } from "../common/PropertyShowSection";

type PropertyDescriptionSectionProps = {
  emptyText: string;
  title: string;
  value: string;
};

export function PropertyDescriptionSection({
  emptyText,
  title,
  value,
}: PropertyDescriptionSectionProps) {
  const hasDescription = value.trim().length > 0;

  return (
    <PropertyShowSection title={title}>
      <div className="text-[15px] leading-7 text-muted-foreground">
        {hasDescription ? (
          <p className="whitespace-pre-line">{value}</p>
        ) : (
          <p>{emptyText}</p>
        )}
      </div>
    </PropertyShowSection>
  );
}
