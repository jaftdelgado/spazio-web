"use client";

import * as React from "react";
import { Description, Label, Separator, Switch, TextField } from "@heroui/react";

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
      <section className="mt-8 grid gap-x-10 gap-y-6 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <h2 className="text-sm font-medium text-slate-900">{title}</h2>
          {hint ? (
            <Description className="mt-1 text-xs leading-relaxed">
              {hint}
            </Description>
          ) : null}
        </div>
        <div className="flex flex-col gap-5">{children}</div>
      </section>
      <Separator className="my-10" />
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
    <TextField fullWidth isRequired={isRequired} name={htmlFor}>
      <Label className={isLabelHidden ? "sr-only" : undefined}>
        {label}
      </Label>
      {children}
      {hint ? (
        <Description className="text-xs">{hint}</Description>
      ) : null}
    </TextField>
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
    <div className="flex items-start justify-between gap-6 border-b border-slate-200/80 py-4 last:border-b-0">
      <div>
        <div className="text-sm font-medium text-slate-900">{title}</div>
        <Description className="mt-0.5 text-xs leading-relaxed">
          {description}
        </Description>
      </div>
      <Switch isSelected={isSelected} onChange={onChange} />
    </div>
  );
}
