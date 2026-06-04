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
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  useEffect(() => {
    if (isLoading || isRedirecting) return;

    if (!isAuthenticated) {
      if (pathname !== redirectTo) {
        setIsRedirecting(true);
        router.push(redirectTo);
      }
    } else if (allowedRoles && user && !allowedRoles.includes(user.roleId)) {
      if (pathname !== "/explore") {
        setIsRedirecting(true);
        router.push("/explore");
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, redirectTo, pathname, isRedirecting]);

  if (isLoading || isRedirecting) {
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
