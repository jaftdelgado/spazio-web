"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import { CreateFormField } from "@properties/components/create/shared/CreateFormPrimitives";

import { AnimatedPriceField } from "./AnimatedPriceField";

export function PricingEditor({
  fieldId,
  label,
  secondaryFieldId,
  secondaryLabel,
  secondarySuffix,
  secondaryValue,
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
  onSecondaryChange,
}: {
  fieldId: string;
  label: string;
  secondaryFieldId?: string;
  secondaryLabel?: string;
  secondarySuffix?: string;
  secondaryValue?: string;
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
  onSecondaryChange?: (value: string) => void;
}) {
  if (emptyState) {
    return (
      <Empty className="min-h-32 rounded-3xl border border-border bg-card p-6 text-left shadow-sm">
        <EmptyHeader className="max-w-none items-start text-left">
          <EmptyTitle className="font-medium text-sm">
            {emptyState.title}
          </EmptyTitle>
          <EmptyDescription>{emptyState.description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="rounded-3xl bg-transparent p-4 shadow-border">
      <div className="flex min-h-32 flex-col justify-between gap-4">
        <div className="grid gap-5 md:grid-cols-2">
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

          {secondaryFieldId && secondaryLabel && secondarySuffix && onSecondaryChange ? (
            <CreateFormField htmlFor={secondaryFieldId} label={secondaryLabel}>
              <AnimatedPriceField
                id={secondaryFieldId}
                locale={locale}
                maxIntegerDigits={maxIntegerDigits}
                suffix={secondarySuffix}
                value={secondaryValue ?? ""}
                onChange={onSecondaryChange}
              />
            </CreateFormField>
          ) : null}
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
