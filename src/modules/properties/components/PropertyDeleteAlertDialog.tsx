"use client";

import { Delete04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertDialog, Button, toast } from "@heroui/react";

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
  return (
    <AlertDialog.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Container>
        <AlertDialog.Dialog className="sm:max-w-105">
          <AlertDialog.CloseTrigger />
          <AlertDialog.Header>
            <AlertDialog.Icon status="danger">
              <HugeiconsIcon icon={Delete04Icon} size={20} strokeWidth={1.8} />
            </AlertDialog.Icon>
            <AlertDialog.Heading>Eliminar propiedad</AlertDialog.Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <p>
              Esta accion eliminara <strong>{propertyTitle}</strong> y no se
              puede deshacer.
            </p>
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button slot="close" variant="tertiary">
              Cancelar
            </Button>
            <Button
              slot="close"
              variant="danger"
              onPress={() => {
                toast.success("Propiedad eliminada", {
                  description: propertyTitle
                    ? `${propertyTitle} fue eliminada correctamente.`
                    : "La propiedad fue eliminada correctamente.",
                });
              }}
            >
              Eliminar
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Dialog>
      </AlertDialog.Container>
    </AlertDialog.Backdrop>
  );
}
