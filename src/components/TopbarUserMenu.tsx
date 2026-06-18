"use client";

import {
  AiMail01Icon,
  Calendar03Icon,
  CreditCardIcon,
  DashboardCircleIcon,
  Logout02Icon,
  NoteIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

type TopbarUserMenuProps = {
  source?: "admin" | "explore";
  showName?: boolean;
};

export function TopbarUserMenu({
  source = "explore",
  showName = false,
}: TopbarUserMenuProps) {
  const router = useRouter();
  const { t } = useTranslation("app");
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const fullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "Usuario";
  const initials = getInitials(fullName || user?.email || "U");
  const canAccessPanel = user?.roleId === 1 || user?.roleId === 2;
  const isClient = user?.roleId === 3;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Avatar className="size-9 border-border/70 bg-muted/70">
          {user?.profilePictureUrl ? (
            <AvatarImage alt={user.email} src={user.profilePictureUrl} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-9 border-border/70 bg-muted/70">
              {user?.profilePictureUrl ? (
                <AvatarImage alt={user.email} src={user.profilePictureUrl} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {fullName || user?.email || "Usuario"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.roleName ?? t("topbarUserMenu.fallbackRole")}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Perfil */}
        <DropdownMenuItem
          onClick={() =>
            router.push(
              ROUTES.settings.withSource(ROUTES.settings.account, source),
            )
          }
        >
          <HugeiconsIcon
            className="text-muted-foreground"
            icon={UserCircleIcon}
            size={16}
            strokeWidth={1.8}
          />
          <span>{t("topbarUserMenu.actions.profile")}</span>
        </DropdownMenuItem>

        {/* Email (solo informativo) */}
        <DropdownMenuItem disabled>
          <HugeiconsIcon
            className="text-muted-foreground"
            icon={AiMail01Icon}
            size={16}
            strokeWidth={1.8}
          />
          <span className="truncate">{user?.email ?? "Usuario"}</span>
        </DropdownMenuItem>

        {/* Opciones exclusivas de cliente */}
        {isClient ? (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => router.push(ROUTES.client.myVisits)}
            >
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={Calendar03Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{t("topbarUserMenu.actions.myVisits")}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push(ROUTES.client.myPayments)}
            >
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={CreditCardIcon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{t("topbarUserMenu.actions.myPayments")}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push(ROUTES.client.myContracts)}
            >
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={NoteIcon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{t("topbarUserMenu.actions.myContracts")}</span>
            </DropdownMenuItem>
          </>
        ) : null}

        {/* Panel de admin/agente */}
        {canAccessPanel ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(ROUTES.admin.root)}>
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={DashboardCircleIcon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{t("topbarUserMenu.actions.panel")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(ROUTES.explore)}>
              <HugeiconsIcon
                className="text-muted-foreground"
                icon={UserCircleIcon}
                size={16}
                strokeWidth={1.8}
              />
              <span>{t("topbarUserMenu.actions.explore")}</span>
            </DropdownMenuItem>
          </>
        ) : null}

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
