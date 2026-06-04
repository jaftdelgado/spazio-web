"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Delete02Icon,
  Mail01Icon,
  ProfileIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HttpError } from "@lib/http/http-errors";
import { useAuth } from "@lib/auth/useAuth";
import { SettingsPageHeader } from "@/modules/settings/components/SettingsPageHeader";
import {
  SettingsField,
  SettingsSection,
} from "@/modules/settings/components/SettingsSection";
import { useDeleteAccount } from "@users/application/hooks/useUsers";

function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    const body = error.body as { error?: string } | null;
    return body?.error ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado";
}

function getInitials(email: string | null | undefined) {
  if (!email) {
    return "SP";
  }

  return email.slice(0, 2).toUpperCase();
}

export function AccountSettingsPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const deleteAccountMutation = useDeleteAccount();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const roleLabel = useMemo(() => {
    if (!user?.roleName) {
      return "Cuenta";
    }

    return user.roleName;
  }, [user?.roleName]);

  const canDeleteAccount = deleteConfirmation.trim() === "ELIMINAR";

  const handleDeleteAccount = async () => {
    setDeleteError(null);

    try {
      await deleteAccountMutation.mutateAsync();
      setIsDeleteDialogOpen(false);
      setDeleteConfirmation("");
      router.push("/auth/login");
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    }
  };

  return (
    <>
      <div>
        <SettingsPageHeader
          eyebrow="Settings · Cuenta"
          title="Cuenta y perfil"
          description="Administra tu informacion personal, tus datos de contacto y la visibilidad basica de tu cuenta."
        />

        <SettingsSection
          title="Identidad"
          hint="Estos datos ayudan a reconocer tu cuenta dentro de Spazio."
        >
          <div className="flex items-center gap-4 rounded-3xl border bg-card px-4 py-4">
            <Avatar className="size-14">
              <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {user?.email ?? "Cuenta Spazio"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {roleLabel}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              Editar avatar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              icon={Mail01Icon}
              label="Correo"
              value={user?.email ?? "Sin correo disponible"}
            />
            <InfoCard icon={Shield01Icon} label="Rol" value={roleLabel} />
          </div>
        </SettingsSection>

        <div className="my-10 border-t border-border/60" />

        <SettingsSection
          title="Perfil"
          hint="Informacion visible para tu experiencia dentro del sitio."
        >
          <SettingsField htmlFor="settings-full-name" label="Nombre completo">
            <Input
              id="settings-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Tu nombre completo"
            />
          </SettingsField>

          <SettingsField htmlFor="settings-phone" label="Telefono">
            <Input
              id="settings-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Tu telefono de contacto"
            />
          </SettingsField>

          <SettingsField
            htmlFor="settings-bio"
            label="Descripcion breve"
            hint="Un resumen corto para tu perfil."
          >
            <textarea
              id="settings-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Cuéntanos un poco sobre ti"
              className="min-h-28 w-full rounded-3xl border border-transparent bg-input/50 px-3 py-2 text-sm text-foreground outline-none transition-[color,box-shadow,background-color] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
          </SettingsField>
        </SettingsSection>

        <div className="my-10 border-t border-border/60" />

        <SettingsSection
          title="Eliminar cuenta"
          hint="Esta accion debe tratarse con cuidado porque afecta tu acceso y tus datos."
        >
          <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-4 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="text-sm font-medium text-foreground">
                  Eliminar mi cuenta
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Elimina tu acceso a Spazio y finaliza tu sesion en este
                  dispositivo. Antes de continuar, revisa cuidadosamente esta
                  decision.
                </p>
              </div>

              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteConfirmation("");
                  setIsDeleteDialogOpen(true);
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} size={16} />
                Eliminar cuenta
              </Button>
            </div>
          </div>
        </SettingsSection>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setDeleteConfirmation("");
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cuenta</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion cerrara tu sesion y eliminara tu acceso a Spazio.
              Para confirmar, escribe <span className="font-medium text-foreground">ELIMINAR</span> en el campo inferior.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="rounded-2xl border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              Una vez confirmada, esta accion puede afectar tu informacion y ya
              no podras acceder con esta cuenta.
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="delete-account-confirmation"
                className="text-sm font-medium text-foreground"
              >
                Escribe ELIMINAR para continuar
              </label>
              <Input
                id="delete-account-confirmation"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder="ELIMINAR"
                aria-invalid={Boolean(deleteError)}
              />
            </div>

            {deleteError ? (
              <p className="text-sm text-destructive">{deleteError}</p>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (!canDeleteAccount || deleteAccountMutation.isPending) {
                  return;
                }

                void handleDeleteAccount();
              }}
              disabled={!canDeleteAccount || deleteAccountMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteAccountMutation.isPending
                ? "Eliminando..."
                : "Eliminar cuenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: typeof ProfileIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border bg-card px-4 py-4">
      <div className="mb-3 flex size-9 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} size={18} />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
