"use client";

import * as React from "react";
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
  const redirectPath = React.useMemo(() => {
    if (isLoading) return null;

    if (!isAuthenticated && pathname !== redirectTo) {
      return redirectTo;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.roleId) && pathname !== "/explore") {
      return "/explore";
    }

    return null;
  }, [allowedRoles, isAuthenticated, isLoading, pathname, redirectTo, user]);

  useEffect(() => {
    if (redirectPath) {
      router.push(redirectPath);
    }
  }, [redirectPath, router]);

  if (isLoading || redirectPath) {
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
