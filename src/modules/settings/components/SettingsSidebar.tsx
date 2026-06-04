"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe02Icon,
  ProfileIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { cn } from "@/lib/utils";

const settingsNavItems = [
  {
    href: "/settings/account",
    icon: ProfileIcon,
    label: "Cuenta y perfil",
    description: "Informacion personal y de cuenta",
  },
  {
    href: "/settings/preferences",
    icon: Globe02Icon,
    label: "Preferencias",
    description: "Idioma y apariencia del sitio",
  },
] as const;

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-border/60 px-4 py-6 lg:border-r lg:border-b-0 lg:px-4 lg:py-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        Settings
      </div>
      <div className="mt-1 flex items-center gap-2">
        <HugeiconsIcon
          icon={Settings02Icon}
          size={16}
          className="text-muted-foreground"
        />
        <span className="truncate text-lg font-medium text-foreground">
          Configuracion
        </span>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {settingsNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-2xl px-3 py-2.5 transition-colors",
                isActive
                  ? "bg-foreground/[0.06] text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground",
              )}
            >
              <div className="flex items-start gap-3">
                <HugeiconsIcon
                  icon={item.icon}
                  size={16}
                  className={cn(
                    "mt-0.5 shrink-0",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
