"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useAuth } from "@lib/auth/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: number[];
  redirectTo?: string;
};

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
      } else if (allowedRoles && user && !allowedRoles.includes(user.roleId)) {
        router.push("/explore");
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={32}
          className="animate-spin text-primary"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.roleId)) {
    return null;
  }

  return <>{children}</>;
}
