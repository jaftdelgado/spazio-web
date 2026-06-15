"use client";

import { useClauses } from "@clauses/application/hooks/useClauses";
import type { ClauseValue } from "@clauses/domain/clause.entity";
import {
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { ClausesTable } from "./components/ClausesTable";

export function ClausesSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();
  const clausesQuery = useClauses({ modalityId: form.modalityId });

  const clauses = clausesQuery.data?.data ?? [];

  const handleChange = (clauseId: number, next: ClauseValue) => {
    patchForm({
      clauses: form.clauses.some((entry) => entry.clauseId === clauseId)
        ? form.clauses.map((entry) =>
            entry.clauseId === clauseId ? { ...entry, value: next } : entry,
          )
        : [...form.clauses, { clauseId, value: next }],
    });
  };

  return (
    <CreateFormSection
      hint={t("create.sections.clauses.hint")}
      title={t("create.sections.clauses.title")}
    >
      {clausesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">
          {t("create.clauses.loading")}
        </p>
      ) : (
        <ClausesTable
          clauses={clauses}
          entries={form.clauses}
          onChange={handleChange}
        />
      )}
    </CreateFormSection>
  );
}
