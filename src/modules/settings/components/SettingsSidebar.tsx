"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Globe02Icon, ProfileIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";

const settingsNavItems = [
  {
    href: "/settings/account",
    icon: ProfileIcon,
    label: "Cuenta y perfil",
  },
  {
    href: "/settings/preferences",
    icon: Globe02Icon,
    label: "Preferencias",
  },
] as const;

export function SettingsSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const source = searchParams.get("from");
  const suffix =
    source === "admin" || source === "explore" ? `?from=${source}` : "";

  return (
    <aside className="lg:sticky lg:top-[calc(var(--settings-topbar-height)+1.5rem)] lg:self-start">
      <nav className="flex flex-col gap-1">
        {settingsNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={`${item.href}${suffix}`}
              className={cn(
                "rounded-2xl px-3 py-2.5 transition-colors",
                isActive
                  ? "bg-foreground/6 text-foreground"
                  : "text-muted-foreground hover:bg-foreground/3 hover:text-foreground",
              )}
            >
              <div className="flex items-center gap-3">
                <HugeiconsIcon
                  icon={item.icon}
                  size={16}
                  className={cn(
                    "shrink-0",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                />
                <p className="min-w-0 truncate text-sm font-medium">
                  {item.label}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
