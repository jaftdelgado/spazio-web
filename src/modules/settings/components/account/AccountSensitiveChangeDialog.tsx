"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PostChangeDialogState } from "@/modules/settings/components/account/account-settings.shared";

type AccountSensitiveChangeDialogProps = {
  dialog: PostChangeDialogState;
  onCloseAndLogout: () => void;
  t: (key: string) => string;
};

export function AccountSensitiveChangeDialog({
  dialog,
  onCloseAndLogout,
  t,
}: AccountSensitiveChangeDialogProps) {
  return (
    <AlertDialog
      open={dialog.open}
      onOpenChange={(open) => {
        if (!open && dialog.open) {
          onCloseAndLogout();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
          <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onCloseAndLogout();
            }}
          >
            {t("profile.securityDialog.action")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
