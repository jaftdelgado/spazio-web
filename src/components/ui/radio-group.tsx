"use client";

import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "peer relative mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full",
        "border-0 outline-none ring-0 focus:outline-none focus-visible:outline-none",
        "transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "data-[state=unchecked]:bg-input/80",
        "data-[state=checked]:bg-primary",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-1 aria-invalid:ring-destructive/40 dark:aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="size-2 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)] animate-[radio-dot-in_200ms_cubic-bezier(0.34,1.56,0.64,1)_forwards] dark:bg-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };
