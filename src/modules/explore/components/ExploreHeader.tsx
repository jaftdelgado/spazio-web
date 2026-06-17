"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardCircleIcon, Login01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useAuth } from "@lib/auth/useAuth";
import { Button } from "@/components/ui/button";
import { TopbarUserMenu } from "@/components/TopbarUserMenu";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";
import { usePropertiesTranslation } from "@/modules/properties/i18n/usePropertiesTranslation";

export function ExploreHeader() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();
  const { t: usersT } = useUsersTranslation();
  const { t: propertiesT } = usePropertiesTranslation();
  const canAccessPanel = !isLoading && role !== null && (role === 1 || role === 2);

  const cta = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (!isAuthenticated) {
      return {
        icon: Login01Icon,
        label: usersT("auth.shell.navigation.toLogin"),
        onClick: () => router.push("/auth/login"),
      };
    }

    if (canAccessPanel) {
      return {
        icon: DashboardCircleIcon,
        label: usersT("auth.shell.menu.goToPanel"),
        onClick: () => router.push("/admin"),
      };
    }

    return null;
  }, [canAccessPanel, isAuthenticated, isLoading, router, usersT]);

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6">
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => router.push("/explore")}
        >
          <div className="flex size-9 items-center justify-center rounded-2xl border bg-card">
            <span className="text-sm font-medium text-foreground">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Spazio</p>
            <p className="text-xs text-muted-foreground">
              {propertiesT("explore.header.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cta ? (
            <Button type="button" onClick={cta.onClick}>
              <HugeiconsIcon icon={cta.icon} size={16} />
              {cta.label}
            </Button>
          ) : isLoading ? (
            <div className="h-9 w-28 rounded-4xl border bg-card" />
          ) : null}

          {isAuthenticated ? <TopbarUserMenu source="explore" /> : null}
        </div>
      </div>
    </header>
  );
}
