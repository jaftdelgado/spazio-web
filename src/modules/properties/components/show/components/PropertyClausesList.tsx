"use client";

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
      <section className="overflow-hidden rounded-none border-y border-border bg-transparent">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-4 border-b border-border/60 py-4 last:border-b-0"
          />
        ))}
      </section>
    );
  }

  if (clauses.length === 0) {
    return (
      <Card className="rounded-2xl bg-card">
        <CardContent className="py-6 text-sm text-muted-foreground">
          {t("show.clausesEmpty")}
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="overflow-hidden rounded-none border-y border-border bg-transparent">
      {clauses.map(({ definition, value }) => (
        <div
          key={value.clauseId}
          className="grid grid-cols-1 gap-3 border-b border-border/60 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-start md:gap-4"
        >
          <p className="m-0 text-[15px] font-normal leading-[1.4] text-foreground">
            {definition
              ? tClause(definition.code)
              : `${t("create.sections.clauses.title")} #${value.clauseId}`}
          </p>
          <p className="m-0 text-[15px] font-normal leading-[1.4] text-muted-foreground">
            {definition
              ? tClauseDescription(definition.code)
              : t("show.values.notAvailable")}
          </p>
          <p className="m-0 text-[15px] font-normal leading-[1.4] text-muted-foreground md:text-right">
            {formatClauseValue(value, definition, t)}
          </p>
        </div>
      ))}
    </section>
  );
}
