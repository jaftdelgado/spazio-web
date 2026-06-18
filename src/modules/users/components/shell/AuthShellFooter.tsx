"use client";

import { UniversalAccessCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useAppFont } from "@/app/font/FontProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

export function AuthShellFooter() {
  const { t } = useUsersTranslation();
  const { setUseDyslexicFont, useDyslexicFont } = useAppFont();

  return (
    <div className="absolute inset-x-0 bottom-0 z-10">
      <div className="mx-auto flex w-full max-w-130 items-center justify-between gap-3 px-6 py-4 sm:px-10">
        <p className="text-sm text-muted-foreground">
          {t("auth.shell.footer.rights")}
        </p>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t("auth.shell.footer.accessibilityLabel")}
            >
              <HugeiconsIcon icon={UniversalAccessCircleIcon} size={18} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-72">
            <DropdownMenuLabel>
              {t("auth.shell.footer.accessibilityMenuTitle")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between gap-4 rounded-2xl px-3 py-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {t("auth.shell.footer.dyslexicFontTitle")}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  {t("auth.shell.footer.dyslexicFontDescription")}
                </p>
              </div>

              <Switch
                checked={useDyslexicFont}
                onCheckedChange={(checked) =>
                  setUseDyslexicFont(Boolean(checked))
                }
                aria-label={t("auth.shell.footer.dyslexicFontTitle")}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
