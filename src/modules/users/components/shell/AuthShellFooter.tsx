"use client";

import { UniversalAccessCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

export function AuthShellFooter() {
  const { t } = useUsersTranslation();

  return (
    <div className="absolute inset-x-0 bottom-0 z-10">
      <div className="mx-auto flex w-full max-w-130 items-center justify-between gap-3 px-6 py-4 sm:px-10">
        <p className="text-sm text-muted-foreground">
          {t("auth.shell.footer.rights")}
        </p>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("auth.shell.footer.accessibilityLabel")}
        >
          <HugeiconsIcon icon={UniversalAccessCircleIcon} size={18} />
        </Button>
      </div>
    </div>
  );
}
