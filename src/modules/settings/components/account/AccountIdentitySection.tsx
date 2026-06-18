"use client";

import { Mail01Icon, ProfileIcon, Shield01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SettingsSection } from "@/modules/settings/components/SettingsSection";
import { getInitials } from "@/modules/settings/components/account/account-settings.shared";

type AccountIdentitySectionProps = {
  displayPhotoUrl: string | null;
  email: string;
  firstName?: string;
  lastName?: string;
  roleLabel: string;
  t: (key: string) => string;
};

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

export function AccountIdentitySection({
  displayPhotoUrl,
  email,
  firstName,
  lastName,
  roleLabel,
  t,
}: AccountIdentitySectionProps) {
  return (
    <SettingsSection
      title={t("profile.identity.title")}
      hint={t("profile.identity.hint")}
    >
      <div className="flex items-center gap-4 rounded-3xl border bg-card px-4 py-4">
        <Avatar className="size-14">
          {displayPhotoUrl ? <AvatarImage alt={email} src={displayPhotoUrl} /> : null}
          <AvatarFallback>{getInitials(firstName, lastName, email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {`${firstName ?? ""} ${lastName ?? ""}`.trim() || "Spazio"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{email}</p>
        </div>
        <div className="rounded-2xl border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {roleLabel}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard
          icon={Mail01Icon}
          label={t("profile.identity.emailLabel")}
          value={email}
        />
        <InfoCard
          icon={Shield01Icon}
          label={t("profile.identity.roleLabel")}
          value={roleLabel}
        />
      </div>
    </SettingsSection>
  );
}
