"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  LaptopIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { AppLocale } from "@/app/i18n/config";
import { useAppLocale } from "@/app/i18n/useAppLocale";
import { useAppTheme } from "@/app/theme/ThemeProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

export type AuthShellHeaderProps = {
  navHref: string;
  navLabel: string;
  discardConfirmation?: {
    cancelLabel: string;
    confirmLabel: string;
    description: string;
    enabled: boolean;
    title: string;
  };
};

export function AuthShellHeader({ header }: { header: AuthShellHeaderProps }) {
  const router = useRouter();
  const { locale, changeLocale } = useAppLocale();
  const { theme, cycleTheme } = useAppTheme();
  const { t } = useUsersTranslation();
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const resolvedTheme = isHydrated ? theme : "system";
  const themeIcon =
    resolvedTheme === "system"
      ? LaptopIcon
      : resolvedTheme === "dark"
        ? Moon02Icon
        : Sun03Icon;

  const handleNavPress = () => {
    if (header.discardConfirmation?.enabled) {
      setIsDiscardDialogOpen(true);
      return;
    }

    router.push(header.navHref);
  };

  return (
    <>
      <div className="absolute inset-x-0 top-0 z-10 ">
        <div className="mx-auto flex w-full max-w-130 items-center justify-between gap-3 px-6 py-4 sm:px-10">
          <Button type="button" variant="outline" onClick={handleNavPress}>
            {header.navLabel}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label={t(`auth.shell.theme.${resolvedTheme}`)}
              onClick={cycleTheme}
            >
              <HugeiconsIcon icon={themeIcon} size={18} />
            </Button>

            <Select
              value={locale}
              onValueChange={(value) => {
                void changeLocale(value as AppLocale);
              }}
            >
              <SelectTrigger
                aria-label={t("auth.shell.localeLabel")}
                className="w-20"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">ES</SelectItem>
                <SelectItem value="en">EN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {header.discardConfirmation ? (
        <AlertDialog
          open={isDiscardDialogOpen}
          onOpenChange={setIsDiscardDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {header.discardConfirmation.title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {header.discardConfirmation.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {header.discardConfirmation.cancelLabel}
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push(header.navHref)}>
                {header.discardConfirmation.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  );
}
