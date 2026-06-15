"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm",
        "border-0 outline-none ring-0 focus:outline-none focus-visible:outline-none",
        "transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "data-[state=unchecked]:bg-input/80",
        "data-[state=checked]:bg-primary data-[state=indeterminate]:bg-primary",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 group-has-disabled/field:opacity-50",
        "aria-invalid:ring-1 aria-invalid:ring-destructive/40 dark:aria-invalid:ring-destructive/30",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="absolute inset-0 flex items-center justify-center text-white dark:text-primary-foreground animate-[checkbox-in_200ms_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
      >
        <HugeiconsIcon icon={Tick02Icon} size={12} strokeWidth={2.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
