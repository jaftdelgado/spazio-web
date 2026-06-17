"use client";

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
import { Input } from "@/components/ui/input";

type AccountDeleteDialogProps = {
  canDelete: boolean;
  confirmation: string;
  error: string | null;
  isDeleting: boolean;
  isOpen: boolean;
  onConfirmationChange: (value: string) => void;
  onConfirmDelete: () => void;
  onOpenChange: (open: boolean) => void;
  t: (key: string) => string;
};

export function AccountDeleteDialog({
  canDelete,
  confirmation,
  error,
  isDeleting,
  isOpen,
  onConfirmationChange,
  onConfirmDelete,
  onOpenChange,
  t,
}: AccountDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("profile.delete.dialogTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("profile.delete.dialogDescription")}{" "}
            <span className="font-medium text-foreground">ELIMINAR</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="rounded-2xl border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {t("profile.delete.dialogWarning")}
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="delete-account-confirmation"
            >
              {t("profile.delete.dialogInput")}
            </label>
            <Input
              aria-invalid={Boolean(error)}
              id="delete-account-confirmation"
              placeholder="ELIMINAR"
              value={confirmation}
              onChange={(event) => onConfirmationChange(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("profile.delete.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={!canDelete || isDeleting}
            onClick={(event) => {
              event.preventDefault();
              if (!canDelete || isDeleting) return;
              onConfirmDelete();
            }}
          >
            {isDeleting ? t("profile.delete.deleting") : t("profile.delete.submit")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
