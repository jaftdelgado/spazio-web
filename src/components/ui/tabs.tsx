"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center p-1 text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:rounded-2xl rounded-full bg-input/80 data-[variant=line]:rounded-none data-[variant=line]:bg-transparent",
  {
    variants: {
      variant: {
        default: "",
        line: "gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = React.useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [ready, setReady] = React.useState(false);

  const updateThumb = React.useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const active = wrapper.querySelector<HTMLElement>('[data-state="active"]');
    if (!active) return;
    const wr = wrapper.getBoundingClientRect();
    const ar = active.getBoundingClientRect();
    setThumb({
      left: ar.left - wr.left,
      top: ar.top - wr.top,
      width: ar.width,
      height: ar.height,
    });
    setReady(true);
  }, []);

  React.useLayoutEffect(() => {
    updateThumb();
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new MutationObserver(updateThumb);
    observer.observe(wrapper, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-state"],
    });
    return () => observer.disconnect();
  }, [updateThumb]);

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      {/* Sliding thumb — flat white pill, no shadow */}
      {variant !== "line" && thumb && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute rounded-full",
            "bg-white dark:bg-white/10",
            "transition-[left,top,width,height] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            ready ? "opacity-100" : "opacity-0",
          )}
          style={{
            left: thumb.left,
            top: thumb.top,
            width: thumb.width,
            height: thumb.height,
          }}
        />
      )}
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </div>
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // Layout
        "relative z-10 inline-flex h-[calc(100%-2px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap",
        "group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:rounded-xl group-data-vertical/tabs:px-3 group-data-vertical/tabs:py-1.5",
        // No borders, no rings, no shadows — flat
        "border-0 outline-none ring-0 shadow-none focus:outline-none focus-visible:outline-none",
        // Inactive
        "text-muted-foreground [&_svg]:text-muted-foreground",
        // Hover
        "hover:text-foreground/70 [&:hover_svg]:text-foreground/70",
        // Active
        "data-[state=active]:text-foreground data-[state=active]:[&_svg]:text-foreground",
        // Smooth color only
        "transition-colors duration-200",
        // Icons
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        // Disabled
        "disabled:pointer-events-none disabled:opacity-50",
        // Line variant underline
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity",
        "group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-1.25 group-data-horizontal/tabs:after:h-0.5",
        "group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5",
        "group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
