"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

function formatCode(code: string) {
  return code
    .split(/[_-]/g)
    .filter(Boolean)
    .map((segment) => segment.charAt(0) + segment.slice(1).toLowerCase())
    .join(" ");
}

export function useClausesTranslation() {
  const { t } = useTranslation("clauses");

  const tClause = useMemo(
    () => (code: string) => {
      const translation = t(`labels.${code}`, { defaultValue: "" });

      if (translation && translation !== `labels.${code}`) {
        return translation;
      }

      return formatCode(code);
    },
    [t],
  );

  const tClauseDescription = useMemo(
    () => (code: string) => {
      const translation = t(`descriptions.${code}`, { defaultValue: "" });

      if (translation && translation !== `descriptions.${code}`) {
        return translation;
      }

      return formatCode(code);
    },
    [t],
  );

  return { tClause, tClauseDescription };
}
