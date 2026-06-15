"use client";

import { useOrientations } from "@catalogs/application/hooks/useCatalogs";
import type { PropertyTypeKind } from "@properties/components/create/propertyTypeKind";
import {
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { CommercialDetailsSubsection } from "./components/CommercialDetailsSubsection";
import { PropertyDetailsEmptyState } from "./components/PropertyDetailsEmptyState";
import { ResidentialDetailsSubsection } from "./components/ResidentialDetailsSubsection";

export function PropertyDetailsSection({
  form,
  propertyTypeKind,
  patchForm,
}: {
  form: PropertyCreateFormState;
  propertyTypeKind: PropertyTypeKind;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();
  const orientationsQuery = useOrientations();

  return (
    <CreateFormSection
      hideHeader
      title={t("create.sections.propertyDetails.title")}
    >
      {form.propertyTypeId === null ? (
        <PropertyDetailsEmptyState mode="unselected" />
      ) : propertyTypeKind === "residential" ? (
        <ResidentialDetailsSubsection
          form={form}
          orientations={orientationsQuery.data ?? []}
          orientationsLoading={orientationsQuery.isLoading}
          patchForm={patchForm}
        />
      ) : propertyTypeKind === "commercial" ? (
        <CommercialDetailsSubsection form={form} patchForm={patchForm} />
      ) : (
        <PropertyDetailsEmptyState mode="other" />
      )}
    </CreateFormSection>
  );
}
