"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft01Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/ui/section-header";

type ProfileStepProps = {
  onSuccess: (data: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => void;
  onBack?: () => void;
};

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/, "Solo se permiten letras"),
  lastName: z
    .string()
    .min(1, "Los apellidos son requeridos")
    .min(2, "Mínimo 2 caracteres")
    .max(50, "Máximo 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/, "Solo se permiten letras"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\+?[\d\s\-().]{7,20}$/.test(val),
      "Ingresa un número de teléfono válido (7–20 dígitos)",
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileStep({ onSuccess, onBack }: ProfileStepProps) {
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const submitProfile = (values: ProfileFormValues) => {
    onSuccess({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone ?? "",
    });
  };

  return (
    <form
      className="space-y-5"
      onSubmit={profileForm.handleSubmit(submitProfile)}
    >
      <SectionHeader
        title="Cuéntanos sobre ti"
        description="Ingresa tu nombre y datos de contacto. Esta información aparecerá en tu perfil."
      />

      <div className="space-y-2">
        <Label htmlFor="firstName">Nombre</Label>
        <Input
          id="firstName"
          type="text"
          autoComplete="given-name"
          placeholder="Nombre"
          aria-invalid={Boolean(profileForm.formState.errors.firstName)}
          className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...profileForm.register("firstName")}
        />
        {profileForm.formState.errors.firstName?.message ? (
          <p className="text-sm text-destructive">
            {profileForm.formState.errors.firstName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Apellidos</Label>
        <Input
          id="lastName"
          type="text"
          autoComplete="family-name"
          placeholder="Apellidos"
          aria-invalid={Boolean(profileForm.formState.errors.lastName)}
          className="h-11 rounded-2xl border-input bg-background px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          {...profileForm.register("lastName")}
        />
        {profileForm.formState.errors.lastName?.message ? (
          <p className="text-sm text-destructive">
            {profileForm.formState.errors.lastName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefono</Label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40">
            <HugeiconsIcon
              icon={SmartPhone01Icon}
              size={17}
              strokeWidth={1.7}
            />
          </span>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Ej. 2281234567"
            aria-invalid={Boolean(profileForm.formState.errors.phone)}
            className="h-11 rounded-2xl border-input bg-background pl-10 pr-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
            {...profileForm.register("phone")}
          />
        </div>
        {profileForm.formState.errors.phone?.message ? (
          <p className="text-sm text-destructive">
            {profileForm.formState.errors.phone.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-1">
        {onBack ? (
          <Button
            type="button"
            variant="ghost"
            className="h-9 rounded-full px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={onBack}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={17} />
            Volver
          </Button>
        ) : (
          <div />
        )}
        <Button type="submit" className="h-10 w-full text-[15px]">
          Continuar
        </Button>
      </div>
    </form>
  );
}
