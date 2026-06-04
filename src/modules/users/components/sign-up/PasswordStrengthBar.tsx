"use client";

import {
  CheckmarkCircle02Icon,
  CircleDashedIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

type PasswordStrengthBarProps = {
  password: string;
};

const strengthColors = [
  "bg-black/10",
  "bg-red-400",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-green-500",
];

const getPasswordStrength = (password: string) => {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  }

  return score;
};

const getPasswordCriteria = (password: string, t: (key: string) => string) => [
  {
    label: t("auth.signUp.password.criteria.length"),
    isMet: password.length >= 8 && password.length <= 32,
  },
  {
    label: t("auth.signUp.password.criteria.uppercase"),
    isMet: /[A-Z]/.test(password),
  },
  {
    label: t("auth.signUp.password.criteria.number"),
    isMet: /[0-9]/.test(password),
  },
  {
    label: t("auth.signUp.password.criteria.specialCharacter"),
    isMet: /[^A-Za-z0-9]/.test(password),
  },
];

export function PasswordStrengthBar({
  password,
}: PasswordStrengthBarProps) {
  const { t } = useUsersTranslation();
  const strength = getPasswordStrength(password);
  const criteria = getPasswordCriteria(password, t);

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              index < strength ? strengthColors[strength] : "bg-black/10"
            }`}
          />
        ))}
      </div>

      <div className="space-y-2">
        {criteria.map((criterion) => (
          <div
            key={criterion.label}
            className="flex items-start gap-2 text-sm leading-5 text-muted-foreground"
          >
            <span
              className={
                criterion.isMet
                  ? "mt-0.5 text-emerald-600"
                  : "mt-0.5 text-muted-foreground/70"
              }
            >
              <HugeiconsIcon
                icon={
                  criterion.isMet ? CheckmarkCircle02Icon : CircleDashedIcon
                }
                size={16}
                strokeWidth={1.8}
              />
            </span>
            <span
              className={
                criterion.isMet ? "text-foreground/85" : "text-muted-foreground"
              }
            >
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
