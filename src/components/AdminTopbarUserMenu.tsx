"use client";

import {
  AccountSetting01Icon,
  AiMail01Icon,
  Logout02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@lib/auth/useAuth";
import { useLogout } from "@users/application/hooks/useUsers";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function resolveRoleLabel(roleId: number | undefined) {
  if (roleId === 1) return "Administrador";
  if (roleId === 2) return "Agente";
  return "Usuario";
}

export function AdminTopbarUserMenu() {
  const router = useRouter();
  const { t } = useTranslation("app");
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const initials = getInitials(user?.email || "U");
  const roleLabel = resolveRoleLabel(user?.roleId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("topbarUserMenu.triggerLabel")}
          className="h-10 rounded-2xl border-border/70 px-2.5"
          size="sm"
          variant="outline"
        >
          <Avatar className="size-7 border-border/70 bg-muted/70">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm md:inline">
            {user?.email ?? "Usuario"}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border-border/70 bg-muted/70">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.email ?? "Usuario"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel}</p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push(ROUTES.admin.root)}>
          <HugeiconsIcon
            className="text-muted-foreground"
            icon={UserCircleIcon}
            size={16}
            strokeWidth={1.8}
          />
          <span>{t("topbarUserMenu.actions.profile")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem disabled>
          <HugeiconsIcon
            className="text-muted-foreground"
            icon={AiMail01Icon}
            size={16}
            strokeWidth={1.8}
          />
          <span className="truncate">{user?.email ?? "Usuario"}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push(ROUTES.admin.root)}>
          <HugeiconsIcon
            className="text-muted-foreground"
            icon={AccountSetting01Icon}
            size={16}
            strokeWidth={1.8}
          />
          <span>{t("topbarUserMenu.actions.settings")}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={async () => {
            await logoutMutation.mutateAsync();
            router.push(ROUTES.auth.login);
          }}
        >
          <HugeiconsIcon
            className="text-destructive"
            icon={Logout02Icon}
            size={16}
            strokeWidth={1.8}
          />
          <span>{t("topbarUserMenu.actions.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
