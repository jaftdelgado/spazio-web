"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertDialog, Button } from "@heroui/react";
import { useVisitsTranslation } from "../i18n/useVisitsTranslation";

type VisitCancelAlertDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
};

export function VisitCancelAlertDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: VisitCancelAlertDialogProps) {
  const { t } = useVisitsTranslation();

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-105">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.8} />
            </AlertDialog.Icon>
            <AlertDialog.Heading>{t("cancelDialog.title")}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>{t("cancelDialog.body")}</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={isLoading}>
              {t("cancelDialog.cancel")}
            </Button>
            <Button variant="danger" isDisabled={isLoading} onClick={onConfirm}>
              {t("cancelDialog.confirm")}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
