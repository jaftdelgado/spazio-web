"use client";

import {
  AccountSetting01Icon,
  AiMail01Icon,
  Logout02Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/routes";
import {
  Avatar,
  Dropdown,
  Header,
  Label,
  Separator,
  toast,
} from "@heroui/react";

const TOPBAR_USER = {
  name: "Jane Doe",
  email: "jane.doe@spazio.mx",
  image:
    "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
} as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminTopbarUserMenu() {
  const router = useRouter();
  const { t } = useTranslation("app");
  const initials = getInitials(TOPBAR_USER.name);

  return (
    <Dropdown>
      <Dropdown.Trigger className="rounded-full outline-none">
        <Avatar
          aria-label={t("topbarUserMenu.triggerLabel")}
          className="size-7 cursor-pointer ring-1 ring-white shadow-sm"
          size="sm"
        >
          <Avatar.Image alt={TOPBAR_USER.name} src={TOPBAR_USER.image} />
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>

      <Dropdown.Popover className="min-w-56" placement="bottom start">
        <div className="border-b border-slate-200 px-3 py-3">
          <div className="flex items-center gap-3">
            <Avatar color="accent" size="sm" variant="soft">
              <Avatar.Image alt={TOPBAR_USER.name} src={TOPBAR_USER.image} />
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-950">
                {TOPBAR_USER.name}
              </p>
              <p className="truncate text-xs text-slate-500">
                {TOPBAR_USER.email}
              </p>
            </div>
          </div>
        </div>

        <Dropdown.Menu
          onAction={(key) => {
            if (key === "logout") {
              router.push(ROUTES.auth.login);
              return;
            }

            if (key === "profile" || key === "settings") {
              toast.success(t("topbarUserMenu.toast.title"), {
                description:
                  key === "profile"
                    ? t("topbarUserMenu.toast.profileDescription")
                    : t("topbarUserMenu.toast.settingsDescription"),
              });
            }
          }}
        >
          <Dropdown.Section>
            <Header>{t("topbarUserMenu.sections.account")}</Header>

            <Dropdown.Item
              id="profile"
              textValue={t("topbarUserMenu.actions.profile")}
            >
              <div className="flex items-center justify-center">
                <HugeiconsIcon
                  className="size-4 shrink-0 text-slate-500"
                  icon={UserCircleIcon}
                  size={16}
                  strokeWidth={1.8}
                />
              </div>
              <Label>{t("topbarUserMenu.actions.profile")}</Label>
            </Dropdown.Item>

            <Dropdown.Item id="email" isDisabled textValue={TOPBAR_USER.email}>
              <div className="flex items-center justify-center">
                <HugeiconsIcon
                  className="size-4 shrink-0 text-slate-400"
                  icon={AiMail01Icon}
                  size={16}
                  strokeWidth={1.8}
                />
              </div>
              <Label>{TOPBAR_USER.email}</Label>
            </Dropdown.Item>

            <Dropdown.Item
              id="settings"
              textValue={t("topbarUserMenu.actions.settings")}
            >
              <div className="flex items-center justify-center">
                <HugeiconsIcon
                  className="size-4 shrink-0 text-slate-500"
                  icon={AccountSetting01Icon}
                  size={16}
                  strokeWidth={1.8}
                />
              </div>
              <Label>{t("topbarUserMenu.actions.settings")}</Label>
            </Dropdown.Item>
          </Dropdown.Section>

          <Separator />

          <Dropdown.Section>
            <Header>{t("topbarUserMenu.sections.session")}</Header>

            <Dropdown.Item
              id="logout"
              textValue={t("topbarUserMenu.actions.logout")}
              variant="danger"
            >
              <div className="flex items-center justify-center">
                <HugeiconsIcon
                  className="size-4 shrink-0 text-danger"
                  icon={Logout02Icon}
                  size={16}
                  strokeWidth={1.8}
                />
              </div>
              <Label>{t("topbarUserMenu.actions.logout")}</Label>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
