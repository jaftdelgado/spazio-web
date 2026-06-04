"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ExploreShell } from "@/modules/explore/layouts/ExploreShell";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={[3]} redirectTo="/auth/login">
      <ExploreShell>
        {children}
      </ExploreShell>
    </ProtectedRoute>
  );
}
