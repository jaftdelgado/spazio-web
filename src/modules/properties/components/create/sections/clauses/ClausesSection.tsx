"use client";

import { useClauses } from "@clauses/application/hooks/useClauses";
import type {
  ClauseValue,
  ClauseValueTypeCode,
} from "@clauses/domain/clause.entity";
import {
  CreateFormSection,
  CreateFormSubsection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { AvailableClausesTable } from "./components/AvailableClausesTable";
import { SelectedClausesTable } from "./components/SelectedClausesTable";

function getDefaultValue(code: ClauseValueTypeCode): ClauseValue {
  if (code === "boolean") {
    return { type: "boolean", value: false };
  }

  if (code === "range") {
    return { type: "range", min: 0, max: 0 };
  }

  return { type: "integer", value: 0 };
}

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
  const selectedClauses = clauses.filter((clause) =>
    form.clauses.some((entry) => entry.clauseId === clause.clauseId),
  );
  const availableClauses = clauses.filter(
    (clause) => !form.clauses.some((entry) => entry.clauseId === clause.clauseId),
  );

  const handleChange = (clauseId: number, next: ClauseValue) => {
    patchForm({
      clauses: form.clauses.some((entry) => entry.clauseId === clauseId)
        ? form.clauses.map((entry) =>
            entry.clauseId === clauseId ? { ...entry, value: next } : entry,
          )
        : [...form.clauses, { clauseId, value: next }],
    });
  };

  const handleAdd = (clauseId: number, valueTypeCode: ClauseValueTypeCode) => {
    if (form.clauses.some((entry) => entry.clauseId === clauseId)) {
      return;
    }

    patchForm({
      clauses: [
        ...form.clauses,
        {
          clauseId,
          value: getDefaultValue(valueTypeCode),
        },
      ],
    });
  };

  const handleRemove = (clauseId: number) => {
    patchForm({
      clauses: form.clauses.filter((entry) => entry.clauseId !== clauseId),
    });
  };

  return (
    <CreateFormSection
      hideHeader
      title={t("create.sections.clauses.title")}
    >
      {clausesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">
          {t("create.clauses.loading")}
        </p>
      ) : (
        <>
          <CreateFormSubsection
            isFirst
            hint={t("create.clauses.selectedHint")}
            title={t("create.clauses.selectedTitle")}
          >
            <SelectedClausesTable
              clauses={selectedClauses}
              entries={form.clauses}
              onChange={handleChange}
              onRemove={handleRemove}
            />
          </CreateFormSubsection>

          <CreateFormSubsection
            isLast
            hint={t("create.clauses.availableHint")}
            title={t("create.clauses.availableTitle")}
          >
            <AvailableClausesTable
              clauses={availableClauses}
              onAdd={handleAdd}
            />
          </CreateFormSubsection>
        </>
      )}
    </CreateFormSection>
  );
}
