"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminTopbarNav } from "@/components/AdminTopbarNav";
import { AdminTopbarUserMenu } from "@/components/AdminTopbarUserMenu";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Only Admins and Agents can access anything under /admin
  const allowedRoles = [1, 2];

  return (
    <ProtectedRoute allowedRoles={allowedRoles} redirectTo="/explore">

      <div className="admin-shell min-h-screen text-slate-950">
        <div className="flex min-h-screen flex-col">
          <header
            className="admin-topbar border-b border-slate-200/80"
            style={{
              paddingInline: "var(--admin-page-padding-x)",
              paddingBlock: "var(--admin-page-padding-y)",
            }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <AdminTopbarNav />
              </div>
              <div className="shrink-0">
                <AdminTopbarUserMenu />
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col p-6">
            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
