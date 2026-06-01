"use client";

import { TickDouble01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertDialog, Button } from "@heroui/react";
import { useVisitsTranslation } from "../i18n/useVisitsTranslation";

type VisitCompleteAlertDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: () => void;
  isLoading: boolean;
};

export function VisitCompleteAlertDialog({
  isOpen,
  onOpenChange,
  onComplete,
  isLoading,
}: VisitCompleteAlertDialogProps) {
  const { t } = useVisitsTranslation();

  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-105">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="info">
              <HugeiconsIcon icon={TickDouble01Icon} size={20} strokeWidth={1.8} />
            </AlertDialog.Icon>
            <AlertDialog.Heading>{t("completeDialog.title")}</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>{t("completeDialog.body")}</p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary" isDisabled={isLoading}>
              {t("completeDialog.cancel")}
            </Button>
            <Button
              color="primary"
              isDisabled={isLoading}
              onPress={onComplete}
            >
              {t("completeDialog.confirm")}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
