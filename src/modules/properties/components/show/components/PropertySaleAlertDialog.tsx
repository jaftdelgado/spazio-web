"use client";

import * as React from "react";
import { CheckmarkCircle02Icon, SaleTag02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

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
import { HttpError } from "@lib/http/http-errors";
import { useFormalizeSale } from "@/modules/sales/application/hooks/useSales";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertySaleAlertDialogProps = {
  agreedAmount: number;
  currency: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  propertyTitle: string;
  propertyUuid: string;
};

const getSaleErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof HttpError) {
    const body = error.body as { error?: string } | null;
    if (body?.error && body.error.trim().length > 0) {
      return body.error;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export function PropertySaleAlertDialog({
  agreedAmount,
  currency,
  isOpen,
  onOpenChange,
  propertyTitle,
  propertyUuid,
}: PropertySaleAlertDialogProps) {
  const { intlLocale, t } = usePropertiesTranslation();
  const formalizeSaleMutation = useFormalizeSale();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const formattedAmount = React.useMemo(
    () =>
      new Intl.NumberFormat(intlLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(agreedAmount),
    [agreedAmount, currency, intlLocale],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setErrorMessage(null);
      formalizeSaleMutation.reset();
    }

    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    setErrorMessage(null);

    try {
      await formalizeSaleMutation.mutateAsync({
        propertyUuid,
        agreedAmount,
      });

      toast.success(t("show.sale.toast.successTitle"), {
        description: t("show.sale.toast.successDescription"),
      });

      handleOpenChange(false);
    } catch (error) {
      setErrorMessage(
        getSaleErrorMessage(error, t("show.sale.errorFallback")),
      );
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={20}
              strokeWidth={1.8}
            />
          </div>
          <AlertDialogTitle>{t("show.sale.dialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("show.sale.dialogDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t("show.sale.summaryTitle")}
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  {t("show.sale.fields.property")}
                </span>
                <span className="text-right text-sm font-medium text-foreground">
                  {propertyTitle || propertyUuid}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  {t("show.sale.fields.salePrice")}
                </span>
                <span className="text-right text-sm font-medium text-foreground">
                  {formattedAmount}
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  {t("show.sale.fields.currency")}
                </span>
                <span className="text-right text-sm font-medium text-foreground">
                  {currency}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
            {t("show.sale.lockedAmountNote")}
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={formalizeSaleMutation.isPending}>
            {t("show.sale.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={formalizeSaleMutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              if (formalizeSaleMutation.isPending) {
                return;
              }

              void handleConfirm();
            }}
          >
            {formalizeSaleMutation.isPending ? (
              <>
                <HugeiconsIcon
                  className="animate-spin"
                  icon={SaleTag02Icon}
                  size={16}
                  strokeWidth={1.8}
                />
                <span>{t("show.sale.submitting")}</span>
              </>
            ) : (
              t("show.sale.confirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
