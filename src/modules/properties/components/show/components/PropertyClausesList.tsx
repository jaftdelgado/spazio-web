"use client";

import { LegalDocument01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Card, CardContent } from "@/components/ui/card";
import { useClausesTranslation } from "@clauses/i18n/useClausesTranslation";
import type { Clause } from "@clauses/domain/clause.entity";
import type { PropertyClause } from "@properties/domain/property.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { formatClauseValue } from "../property-show.helpers";

type PropertyClausesListProps = {
  clauses: { definition: Clause | null; value: PropertyClause }[];
  isLoading: boolean;
};

export function PropertyClausesList({
  clauses,
  isLoading,
}: PropertyClausesListProps) {
  const { t } = usePropertiesTranslation();
  const { tClause, tClauseDescription } = useClausesTranslation();

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[112px] animate-pulse rounded-[24px] bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (clauses.length === 0) {
    return (
      <Card className="rounded-[28px] border-0 bg-muted/25 shadow-none ring-0">
        <CardContent className="py-6 text-sm text-muted-foreground">
          {t("show.clausesEmpty")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {clauses.map(({ definition, value }) => (
        <div
          key={value.clauseId}
          className="flex flex-col gap-4 rounded-[24px] bg-background px-5 py-5 ring-1 ring-border/60 md:flex-row md:items-start md:justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <HugeiconsIcon
                icon={LegalDocument01Icon}
                size={16}
                strokeWidth={1.8}
              />
              <span>
                {definition
                  ? tClause(definition.code)
                  : `${t("create.sections.clauses.title")} #${value.clauseId}`}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {definition
                ? tClauseDescription(definition.code)
                : t("show.values.notAvailable")}
            </p>
          </div>
          <div className="inline-flex items-center rounded-full bg-muted/35 px-3 py-1.5 text-sm font-medium text-foreground">
            {formatClauseValue(value, definition, t)}
          </div>
        </div>
      ))}
    </div>
  );
}
