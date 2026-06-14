"use client";

import * as React from "react";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function CreateFormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="mt-8 grid gap-x-10 gap-y-6 lg:grid-cols-[190px_minmax(0,1fr)]">
        <div>
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          {hint ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-5">{children}</div>
      </section>
      <div className="my-10 h-px bg-border" />
    </>
  );
}

export function CreateFormField({
  label,
  htmlFor,
  hint,
  isLabelHidden = false,
  isRequired = false,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  isLabelHidden?: boolean;
  isRequired?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2" data-required={isRequired}>
      <Label
        className={cn(isLabelHidden && "sr-only")}
        htmlFor={htmlFor}
      >
        {label}
        {isRequired ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function CreateFormSwitchRow({
  title,
  description,
  isSelected,
  onChange,
}: {
  title: string;
  description: string;
  isSelected: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-4 last:border-b-0">
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch checked={isSelected} onCheckedChange={onChange} />
    </div>
  );
}
