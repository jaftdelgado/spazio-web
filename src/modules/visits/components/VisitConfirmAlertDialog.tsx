"use client";

import { Tick01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertDialog, Button } from "@heroui/react";
import { useVisitsTranslation } from "../i18n/useVisitsTranslation";

type VisitConfirmAlertDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
};

export function VisitConfirmAlertDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: VisitConfirmAlertDialogProps) {
  const { t } = useVisitsTranslation();

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-105">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="success">
              <HugeiconsIcon icon={Tick01Icon} size={20} strokeWidth={1.8} />
            </AlertDialog.Icon>
            <AlertDialog.Heading>{t("confirmDialog.title")}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>{t("confirmDialog.body")}</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={isLoading}>
              {t("confirmDialog.cancel")}
            </Button>
            <Button
              color="success"
              isDisabled={isLoading}
              onPress={onConfirm}
            >
              {t("confirmDialog.confirm")}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
