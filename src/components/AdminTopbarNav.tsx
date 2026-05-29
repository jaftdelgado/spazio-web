"use client";

import {
  Building03Icon,
  Calendar03Icon,
  CreditCardIcon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Button } from "@heroui/react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes";

type TopbarNavItem = {
  href: string;
  icon: IconSvgElement;
  labelKey:
    | "adminTopbarNav.items.summary"
    | "adminTopbarNav.items.properties"
    | "adminTopbarNav.items.visits"
    | "adminTopbarNav.items.payments";
};

const adminNavItems: readonly TopbarNavItem[] = [
  {
    href: ROUTES.admin.root,
    icon: Home01Icon,
    labelKey: "adminTopbarNav.items.summary",
  },
  {
    href: ROUTES.admin.properties,
    icon: Building03Icon,
    labelKey: "adminTopbarNav.items.properties",
  },
  {
    href: ROUTES.admin.visits,
    icon: Calendar03Icon,
    labelKey: "adminTopbarNav.items.visits",
  },
  {
    href: ROUTES.admin.payments,
    icon: CreditCardIcon,
    labelKey: "adminTopbarNav.items.payments",
  },
] as const;

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function isNavItemActive(pathname: string, href: string) {
  if (href === ROUTES.admin.root) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminTopbarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation("app");

  return (
    <nav
      aria-label={t("adminTopbarNav.ariaLabel")}
      className="min-w-0 flex-1 overflow-x-auto"
    >
      <div className="flex min-w-max items-center gap-2">
        {adminNavItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);

          return (
            <Button
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "h-9 rounded-full px-3.5 text-sm font-medium outline-none transition-colors",
                isActive
                  ? "bg-slate-950 text-white hover:bg-slate-950"
                  : "bg-white/70 text-slate-700 hover:bg-slate-900/8 hover:text-slate-950",
              )}
              onPress={() => router.push(item.href)}
              variant="ghost"
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
