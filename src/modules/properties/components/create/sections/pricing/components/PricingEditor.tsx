"use client";

import { CreateFormField } from "@properties/components/create/shared/CreateFormPrimitives";

import { AnimatedPriceField } from "./AnimatedPriceField";

export function PricingEditor({
  fieldId,
  label,
  hint,
  locale,
  suffix,
  value,
  emptyState,
  onChange,
}: {
  fieldId: string;
  label: string;
  hint: string;
  locale: string;
  suffix: string;
  value: string;
  emptyState?: {
    title: string;
    description: string;
  };
  onChange: (value: string) => void;
}) {
  if (emptyState) {
    return (
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="px-5 py-6">
          <div className="text-sm font-medium text-foreground">
            {emptyState.title}
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {emptyState.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card px-3 py-3 shadow-sm">
      <CreateFormField htmlFor={fieldId} hint={hint} label={label}>
        <AnimatedPriceField
          id={fieldId}
          locale={locale}
          suffix={suffix}
          value={value}
          onChange={onChange}
        />
      </CreateFormField>
    </div>
  );
}
