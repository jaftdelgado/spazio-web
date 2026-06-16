"use client";

import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminPropertyEditLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <ProtectedRoute allowedRoles={[1]} redirectTo="/explore">
      {children}
    </ProtectedRoute>
  );
}
