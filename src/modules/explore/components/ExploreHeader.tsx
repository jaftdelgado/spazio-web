"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ComputerPhoneSyncIcon,
  DashboardCircleIcon,
  Logout03Icon,
  Login01Icon,
  Moon02Icon,
  Settings02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useAppLocale } from "@/app/i18n/useAppLocale";
import { useAppTheme } from "@/app/theme/ThemeProvider";
import { useAuth } from "@lib/auth/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(email: string | null | undefined) {
  if (!email) {
    return "SP";
  }

  return email.slice(0, 2).toUpperCase();
}

export function ExploreHeader() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const { theme } = useAppTheme();
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const canAccessPanel = role !== null && role !== 3;

  const cta = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (!isAuthenticated) {
      return {
        icon: Login01Icon,
        label: "Iniciar sesion",
        onClick: () => router.push("/auth/login"),
      };
    }

    if (canAccessPanel) {
      return {
        icon: DashboardCircleIcon,
        label: "Ir al panel",
        onClick: () => router.push("/admin"),
      };
    }

    return null;
  }, [canAccessPanel, isAuthenticated, isLoading, router]);

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-2xl border bg-card">
            <span className="text-sm font-medium text-foreground">S</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Spazio</p>
            <p className="text-xs text-muted-foreground">
              Explora propiedades publicas
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

          {isAuthenticated ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Abrir menu de cuenta">
                  <Avatar className="size-8">
                    <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {user?.email ?? "Cuenta"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Preferencias de cuenta
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Ajustes</DropdownMenuLabel>

                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <HugeiconsIcon icon={Settings02Icon} size={16} />
                  Mi perfil
                </DropdownMenuItem>

                <StaticPreferenceRow
                  icon={ComputerPhoneSyncIcon}
                  label="Lenguaje"
                  control={
                    <InlineToggle
                      options={[
                        { label: "ES", active: locale === "es" },
                        { label: "EN", active: locale === "en" },
                      ]}
                    />
                  }
                />

                <StaticPreferenceRow
                  icon={
                    theme === "dark"
                      ? Moon02Icon
                      : theme === "light"
                        ? Sun03Icon
                        : ComputerPhoneSyncIcon
                  }
                  label="Modo"
                  control={
                    <InlineToggle
                      options={[
                        { label: "SIS", active: theme === "system" },
                        { label: "CL", active: theme === "light" },
                        { label: "OSC", active: theme === "dark" },
                      ]}
                    />
                  }
                />

                {canAccessPanel ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      <HugeiconsIcon icon={DashboardCircleIcon} size={16} />
                      Ir a panel
                    </DropdownMenuItem>
                  </>
                ) : null}

                <DropdownMenuSeparator />

                <DropdownMenuItem variant="destructive">
                  <HugeiconsIcon icon={Logout03Icon} size={16} />
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function StaticPreferenceRow({
  icon,
  label,
  control,
}: {
  icon: typeof DashboardCircleIcon;
  label: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
      <HugeiconsIcon icon={icon} size={16} className="text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="ml-auto">{control}</div>
    </div>
  );
}

function InlineToggle({
  options,
}: {
  options: Array<{ label: string; active: boolean }>;
}) {
  return (
    <div className="inline-flex items-center rounded-full border bg-muted/60 p-0.5">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          className={
            option.active
              ? "rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm"
              : "rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
          }
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
