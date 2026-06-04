"use client";

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SettingsShell } from "@/modules/settings/layouts/SettingsShell";

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute>
      <SettingsShell>{children}</SettingsShell>
    </ProtectedRoute>
  );
}
