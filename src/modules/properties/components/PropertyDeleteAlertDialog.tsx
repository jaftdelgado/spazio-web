"use client";

import { Delete04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertDialog, Button, toast } from "@heroui/react";
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
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-105">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <HugeiconsIcon icon={Delete04Icon} size={20} strokeWidth={1.8} />
            </AlertDialog.Icon>
            <AlertDialog.Heading>{t("deleteDialog.title")}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            {propertyTitle ? (
              <p>
                {t("deleteDialog.bodyPrefix")} <strong>{propertyTitle}</strong>{" "}
                {t("deleteDialog.bodySuffix")}
              </p>
            ) : (
              <p>{t("deleteDialog.bodyWithoutTitle")}</p>
            )}
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary">
              {t("deleteDialog.cancel")}
            </Button>
            <Button
              slot="close"
              variant="danger"
              onPress={() => {
                toast.success(t("deleteDialog.successTitle"), {
                  description: propertyTitle
                    ? t("deleteDialog.successDescription", { propertyTitle })
                    : t("deleteDialog.successDescriptionFallback"),
                });
              }}
            >
              {t("deleteDialog.confirm")}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
