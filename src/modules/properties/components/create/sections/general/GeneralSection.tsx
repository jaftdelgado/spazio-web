"use client";

import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";

import { IdentitySubsection } from "./components/IdentitySubsection";
import { ModalitySubsection } from "./components/ModalitySubsection";
import { PropertyTypeSubsection } from "./components/PropertyTypeSubsection";

export function GeneralSection({
  canClearAgentSelection = true,
  form,
  disableImmutableFields = false,
  patchForm,
}: {
  canClearAgentSelection?: boolean;
  form: PropertyCreateFormState;
  disableImmutableFields?: boolean;
  patchForm: PatchPropertyCreateForm;
}) {
  return (
    <>
      <IdentitySubsection
        canClearAgentSelection={canClearAgentSelection}
        form={form}
        patchForm={patchForm}
      />
      <PropertyTypeSubsection
        disabled={disableImmutableFields}
        form={form}
        patchForm={patchForm}
      />
      <ModalitySubsection
        disabled={disableImmutableFields}
        form={form}
        patchForm={patchForm}
      />
    </>
  );
}
