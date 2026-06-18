"use client";

import { Alert02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HttpError } from "@lib/http/http-errors";
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

function getClausesErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 401 || error.status === 403) {
      return "Tu sesion ya no permite cargar las clausulas. Vuelve a iniciar sesion e intentalo de nuevo.";
    }

    if (error.status >= 500) {
      return "No pudimos cargar las clausulas disponibles por un problema del servidor. Intentalo nuevamente en unos minutos.";
    }
  }

  return "No pudimos cargar las clausulas disponibles para la modalidad seleccionada.";
}

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
      ) : clausesQuery.isError ? (
        <Empty className="min-h-40 rounded-3xl border border-dashed border-border bg-card px-6 py-8">
          <EmptyHeader>
            <EmptyMedia className="bg-destructive/10 text-destructive" variant="icon">
              <HugeiconsIcon icon={Alert02Icon} size={20} strokeWidth={1.8} />
            </EmptyMedia>
            <EmptyTitle>{t("states.loadErrorTitle")}</EmptyTitle>
            <EmptyDescription className="max-w-lg">
              {getClausesErrorMessage(clausesQuery.error)}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className=""
              disabled={clausesQuery.isRefetching}
              size="sm"
              type="button"
              onClick={() => {
                void clausesQuery.refetch();
              }}
            >
              {t("states.retry")}
            </Button>
          </EmptyContent>
        </Empty>
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
