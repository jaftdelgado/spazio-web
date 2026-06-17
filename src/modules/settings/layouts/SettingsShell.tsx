"use client";

import type { CSSProperties, ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import { AdminTopbarNav } from "@/components/AdminTopbarNav";
import { AdminTopbarUserMenu } from "@/components/AdminTopbarUserMenu";
import { useAuth } from "@lib/auth/useAuth";
import { ExploreHeader } from "@/modules/explore/components/ExploreHeader";
import { SettingsSidebar } from "@/modules/settings/components/SettingsSidebar";

export function SettingsShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const source = searchParams.get("from");
  const isPanelUser =
    source === "admin" || (source !== "explore" && (user?.roleId === 1 || user?.roleId === 2));

  return (
    <div
      className="min-h-svh bg-background text-foreground"
      style={
        {
          "--settings-topbar-height": isPanelUser
            ? "var(--admin-topbar-height)"
            : "var(--explore-topbar-height)",
        } as CSSProperties
      }
    >
      {isPanelUser ? (
        <header
          className="admin-topbar sticky top-0 z-50 border-b border-border/70 bg-background/90"
          style={{ minHeight: "var(--admin-topbar-height)" }}
        >
          <div className="admin-page-view mx-auto flex min-h-[var(--admin-topbar-height)] w-full max-w-7xl items-center">
            <div className="flex w-full items-center justify-between gap-4 py-(--admin-page-padding-y)">
              <div className="min-w-0 flex-1">
                <AdminTopbarNav />
              </div>
              <div className="shrink-0">
                <AdminTopbarUserMenu />
              </div>
            </div>
          </div>
        </header>
      ) : (
        <ExploreHeader />
      )}

      <div
        className="mx-auto w-full max-w-7xl px-6 pb-10 lg:pt-8"
        style={{
          paddingTop: isPanelUser
            ? "1.5rem"
            : "calc(var(--explore-topbar-height) + 1.5rem)",
        }}
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <div className="border-b border-border/60 pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
            <SettingsSidebar />
          </div>
          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
