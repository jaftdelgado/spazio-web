"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Copy01Icon,
  Loading03Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "@/components/ui/section-header";
import { useAuth } from "@lib/auth/useAuth";
import { useAdminCreateUser } from "@users/application/hooks/useUsers";
import type { AdminCreateUserResult } from "@users/domain/users.entity";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";
import { getUserErrorMessage } from "@users/lib/user-errors";

const createStaffSchema = (t: (key: string) => string) =>
  z.object({
    firstName: z.string().min(1, t("staff.validation.firstName")),
    lastName: z.string().min(1, t("staff.validation.lastName")),
    email: z.string().email(t("auth.login.validation.emailInvalid")),
    phone: z.string().optional(),
    roleId: z.enum(["1", "2"]),
  });

type StaffFormValues = z.infer<ReturnType<typeof createStaffSchema>>;

export function AdminUsersPageContent() {
  const { t } = useUsersTranslation();
  const { user } = useAuth();
  const mutation = useAdminCreateUser();
  const [result, setResult] = useState<AdminCreateUserResult | null>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(createStaffSchema(t)),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roleId: "2",
    },
  });
  const selectedRoleId = useWatch({
    control: form.control,
    name: "roleId",
  });

  const submit = async (values: StaffFormValues) => {
    try {
      const created = await mutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone || undefined,
        roleId: Number(values.roleId),
      });

      setResult(created);
      toast.success(t("staff.successTitle"), {
        description: created.message,
      });
    } catch (error) {
      form.setError("root", {
        message: getUserErrorMessage(error, t("auth.common.unexpectedError")),
      });
    }
  };

  if (user?.roleId !== 1) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-8">
        <SectionHeader
          title={t("staff.forbiddenTitle")}
          description={t("staff.forbiddenDescription")}
        />
      </div>
    );
  }

  return (
    <div className="admin-page-view space-y-8">
      <SectionHeader
        title={t("staff.title")}
        description={t("staff.description")}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form
          className="rounded-3xl border bg-card p-6"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="staff-first-name">{t("staff.fields.firstName")}</Label>
              <Input id="staff-first-name" {...form.register("firstName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-last-name">{t("staff.fields.lastName")}</Label>
              <Input id="staff-last-name" {...form.register("lastName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-email">{t("staff.fields.email")}</Label>
              <Input
                id="staff-email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-phone">{t("staff.fields.phone")}</Label>
              <Input id="staff-phone" {...form.register("phone")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="staff-role">{t("staff.fields.role")}</Label>
              <Select
                value={selectedRoleId}
                onValueChange={(value) =>
                  form.setValue("roleId", value as "1" | "2", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="staff-role" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("staff.roles.admin")}</SelectItem>
                  <SelectItem value="2">{t("staff.roles.agent")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.formState.errors.root?.message ? (
            <p className="mt-4 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <div className="mt-6 flex justify-end">
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? (
                <>
                  <HugeiconsIcon
                    className="animate-spin"
                    icon={Loading03Icon}
                    size={16}
                  />
                  <span>{t("staff.submitting")}</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={UserAdd01Icon} size={16} />
                  <span>{t("staff.submit")}</span>
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="rounded-3xl border bg-card p-6">
          <SectionHeader
            className="mb-4"
            title={t("staff.temporaryPasswordTitle")}
            description={t("staff.temporaryPasswordDescription")}
          />

          {result ? (
            <div className="space-y-4">
              <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {t("staff.passwordLabel")}
                </p>
                <p className="mt-2 break-all font-mono text-lg font-semibold text-foreground">
                  {result.temporaryPassword}
                </p>
              </div>

              <Button
                className="w-full"
                type="button"
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(result.temporaryPassword);
                  toast.success(t("staff.copySuccessTitle"), {
                    description: t("staff.copySuccessDescription"),
                  });
                }}
              >
                <HugeiconsIcon icon={Copy01Icon} size={16} />
                <span>{t("staff.copy")}</span>
              </Button>

              <p className="text-sm leading-6 text-muted-foreground">
                {t("staff.shareHint")}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
              {t("staff.emptyState")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
