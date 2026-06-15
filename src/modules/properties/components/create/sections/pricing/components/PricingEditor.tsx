"use client";

import { Switch } from "@/components/ui/switch";
import { CreateFormField } from "@properties/components/create/shared/CreateFormPrimitives";

import { AnimatedPriceField } from "./AnimatedPriceField";

export function PricingEditor({
  fieldId,
  label,
  locale,
  suffix,
  value,
  maxIntegerDigits,
  emptyState,
  showNegotiable = false,
  isNegotiable = false,
  negotiableLabel,
  negotiableDescription,
  onChange,
  onNegotiableChange,
}: {
  fieldId: string;
  label: string;
  locale: string;
  suffix: string;
  value: string;
  maxIntegerDigits: number;
  emptyState?: {
    title: string;
    description: string;
  };
  showNegotiable?: boolean;
  isNegotiable?: boolean;
  negotiableLabel?: string;
  negotiableDescription?: string;
  onChange: (value: string) => void;
  onNegotiableChange?: (value: boolean) => void;
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
    <div className="rounded-3xl bg-transparent p-4 shadow-border">
      <div className="flex min-h-32 flex-col justify-between gap-4">
        <div>
          <CreateFormField htmlFor={fieldId} label={label}>
            <AnimatedPriceField
              id={fieldId}
              locale={locale}
              maxIntegerDigits={maxIntegerDigits}
              suffix={suffix}
              value={value}
              onChange={onChange}
            />
          </CreateFormField>
        </div>

        <div className="min-h-14">
          {showNegotiable && negotiableLabel && onNegotiableChange ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {negotiableLabel}
                </div>
                {negotiableDescription ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {negotiableDescription}
                  </p>
                ) : null}
              </div>
              <Switch
                checked={isNegotiable}
                onCheckedChange={onNegotiableChange}
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="h-14 rounded-2xl bg-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
}
