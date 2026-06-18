"use client";

import {
  ArrowRight01Icon,
  Building03Icon,
  Calendar03Icon,
  CreditCardIcon,
  File01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@lib/auth/useAuth";

type TopbarNavItem = {
  href: string;
  icon: IconSvgElement;
  labelKey:
  | "adminTopbarNav.items.explore"
  | "adminTopbarNav.items.properties"
  | "adminTopbarNav.items.contracts"
  | "adminTopbarNav.items.visits"
  | "adminTopbarNav.items.payments"
  | "adminTopbarNav.items.users";
  allowedRoles: number[];
};

const adminNavItems: readonly TopbarNavItem[] = [
  {
    href: ROUTES.explore,
    icon: ArrowRight01Icon,
    labelKey: "adminTopbarNav.items.explore",
    allowedRoles: [1, 2],
  },
  {
    href: ROUTES.admin.properties,
    icon: Building03Icon,
    labelKey: "adminTopbarNav.items.properties",
    allowedRoles: [1, 2],
  },
  {
  href: ROUTES.admin.contracts,
  icon: File01Icon,
  labelKey: "adminTopbarNav.items.contracts",
  allowedRoles: [1, 2],
},
  {
    href: ROUTES.admin.visits,
    icon: Calendar03Icon,
    labelKey: "adminTopbarNav.items.visits",
    allowedRoles: [1, 2],
  },
  {
    href: ROUTES.admin.payments,
    icon: CreditCardIcon,
    labelKey: "adminTopbarNav.items.payments",
    allowedRoles: [1, 2],
  },
  {
    href: ROUTES.admin.users,
    icon: UserGroupIcon,
    labelKey: "adminTopbarNav.items.users",
    allowedRoles: [1],
  },
] as const;

function isNavItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminTopbarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation("app");
  const { user } = useAuth();

  return (
    <nav
      aria-label={t("adminTopbarNav.ariaLabel")}
      className="min-w-0 flex-1 overflow-x-auto"
    >
      <div className="flex min-w-max items-center gap-2">
        {adminNavItems.map((item) => {
          if (user && !item.allowedRoles.includes(user.roleId)) {
            return null;
          }

          const isActive = isNavItemActive(pathname, item.href);

          return (
            <Button
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "h-9 px-3.5 text-sm font-medium shadow-none",
                isActive
                  ? "bg-foreground text-background hover:bg-foreground"
                  : "border-border/70 bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => router.push(item.href)}
            >
              <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.8} />
              <span>{t(item.labelKey)}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
