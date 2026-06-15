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
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  return (
    <>
      <IdentitySubsection form={form} patchForm={patchForm} />
      <PropertyTypeSubsection form={form} patchForm={patchForm} />
      <ModalitySubsection form={form} patchForm={patchForm} />
    </>
  );
}
