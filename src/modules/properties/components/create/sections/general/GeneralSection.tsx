"use client";

import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";

import { IdentitySubsection } from "./components/IdentitySubsection";
import { ModalitySubsection } from "./components/ModalitySubsection";
import { PropertyTypeSubsection } from "./components/PropertyTypeSubsection";

export function GeneralSection({
  form,
  disableImmutableFields = false,
  patchForm,
}: {
  form: PropertyCreateFormState;
  disableImmutableFields?: boolean;
  patchForm: PatchPropertyCreateForm;
}) {
  return (
    <>
      <IdentitySubsection form={form} patchForm={patchForm} />
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
