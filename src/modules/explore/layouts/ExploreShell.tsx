"use client";

import type { ReactNode } from "react";

import { ExploreHeader } from "@/modules/explore/components/ExploreHeader";

type ExploreShellProps = {
  children: ReactNode;
};

export function ExploreShell({ children }: ExploreShellProps) {
  return (
    <div className="min-h-svh bg-background">
      <ExploreHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-24 pb-10">
        {children}
      </div>
    </div>
  );
}
