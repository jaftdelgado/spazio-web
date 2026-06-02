"use client";

import { Description, Surface } from "@heroui/react";

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
      <Surface className="overflow-hidden rounded-3xl">
        <div className="px-5 py-6">
          <div className="text-sm font-medium text-slate-900">
            {emptyState.title}
          </div>
          <Description className="mt-1 text-sm leading-relaxed">
            {emptyState.description}
          </Description>
        </div>
      </Surface>
    );
  }

  return (
    <Surface className="overflow-hidden rounded-3xl px-3 py-3">
      <CreateFormField htmlFor={fieldId} hint={hint} label={label}>
        <AnimatedPriceField
          id={fieldId}
          locale={locale}
          suffix={suffix}
          value={value}
          onChange={onChange}
        />
      </CreateFormField>
    </Surface>
  );
}
