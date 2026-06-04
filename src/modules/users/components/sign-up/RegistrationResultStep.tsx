"use client";

import { useRouter } from "next/navigation";
import {
  Alert02Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

type RegistrationResultStepProps = {
  message?: string;
  onRetry?: () => void;
  status: "success" | "error";
};

export function RegistrationResultStep({
  message,
  onRetry,
  status,
}: RegistrationResultStepProps) {
  const router = useRouter();
  const { t } = useUsersTranslation();
  const isSuccess = status === "success";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div
          className={
            isSuccess
              ? "flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
              : "flex size-12 items-center justify-center rounded-full bg-amber-50 text-amber-600"
          }
        >
          <HugeiconsIcon
            icon={isSuccess ? CheckmarkCircle02Icon : Alert02Icon}
            size={24}
            strokeWidth={1.8}
          />
        </div>

        <SectionHeader
          className="mb-0"
          title={
            isSuccess
              ? t("auth.signUp.result.success.title")
              : t("auth.signUp.result.error.title")
          }
          description={
            isSuccess
              ? t("auth.signUp.result.success.description")
              : message ??
                t("auth.signUp.result.error.defaultMessage")
          }
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        {isSuccess ? (
          <div />
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="h-9 rounded-full px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onRetry}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
            {t("auth.signUp.result.actions.retry")}
          </Button>
        )}

        <Button
          type="button"
          className="h-10 min-w-32 px-5 text-[15px]"
          onClick={() => router.push("/auth/login")}
        >
          {t("auth.signUp.result.actions.goToLogin")}
        </Button>
      </div>
    </div>
  );
}
