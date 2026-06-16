"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full",
        "border-0 outline-none ring-0 focus:outline-none focus-visible:outline-none",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "data-[size=default]:h-5 data-[size=default]:w-11",
        "data-[size=sm]:h-4 data-[size=sm]:w-7",
        "transition-colors duration-300 ease-in-out",
        "data-[state=unchecked]:bg-input",
        "data-[state=checked]:bg-primary",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background",
          "shadow-[0_1px_2px_rgba(0,0,0,0.18)]",
          "ring-0 outline-none",
          "group-data-[size=default]/switch:h-4 group-data-[size=default]/switch:w-6",
          "group-data-[size=sm]/switch:h-3 group-data-[size=sm]/switch:w-4",
          "transition-transform duration-200 ease-in-out",
          "group-data-[size=default]/switch:data-[state=unchecked]:translate-x-0.5",
          "group-data-[size=default]/switch:data-[state=checked]:translate-x-4.5",
          "group-data-[size=sm]/switch:data-[state=unchecked]:translate-x-0.5",
          "group-data-[size=sm]/switch:data-[state=checked]:translate-x-2.5",
          "dark:data-[state=checked]:bg-primary-foreground",
          "dark:data-[state=unchecked]:bg-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
