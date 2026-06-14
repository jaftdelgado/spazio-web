"use client";

import { Delete04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertyDeleteAlertDialogProps = {
  isOpen: boolean;
  propertyTitle: string;
  onOpenChange: (isOpen: boolean) => void;
};

export function PropertyDeleteAlertDialog({
  isOpen,
  propertyTitle,
  onOpenChange,
}: PropertyDeleteAlertDialogProps) {
  const { t } = usePropertiesTranslation();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <HugeiconsIcon icon={Delete04Icon} size={20} strokeWidth={1.8} />
          </div>
          <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {propertyTitle ? (
              <>
                {t("deleteDialog.bodyPrefix")} <strong>{propertyTitle}</strong>{" "}
                {t("deleteDialog.bodySuffix")}
              </>
            ) : (
              t("deleteDialog.bodyWithoutTitle")
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90">
            {t("deleteDialog.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
