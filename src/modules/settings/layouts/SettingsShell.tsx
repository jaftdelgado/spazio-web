"use client";

import type { ReactNode } from "react";

import { SettingsSidebar } from "@/modules/settings/components/SettingsSidebar";

export function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto grid min-h-svh max-w-6xl grid-cols-1 lg:grid-cols-[280px_1fr]">
        <SettingsSidebar />
        <main className="px-6 py-8 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
