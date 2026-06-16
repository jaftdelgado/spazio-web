"use client";

import * as React from "react";

import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MultiplicationSignCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
        ),
        info: (
          <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="size-4" />
        ),
        warning: (
          <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
        ),
        error: (
          <HugeiconsIcon icon={MultiplicationSignCircleIcon} strokeWidth={2} className="size-4" />
        ),
        loading: (
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "color-mix(in oklab, var(--popover) 88%, transparent)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "color-mix(in oklab, var(--border) 92%, transparent)",
          "--border-radius": "20px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "rounded-[20px] border border-border/70 bg-popover/90 text-popover-foreground shadow-lg shadow-black/5 backdrop-blur-xl",
          title: "text-[13px] font-medium tracking-normal",
          description: "text-[12px] text-muted-foreground",
          actionButton:
            "rounded-full bg-foreground px-3 text-[12px] font-medium text-background hover:bg-foreground/90",
          cancelButton:
            "rounded-full border border-border bg-background/70 px-3 text-[12px] font-medium text-foreground hover:bg-muted",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
