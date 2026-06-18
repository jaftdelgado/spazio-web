"use client";

import { Input } from "@/components/ui/input";

import {
  CreateFormField,
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { AgentAssignmentSubsection } from "./AgentAssignmentSubsection";
import { DescriptionField } from "./DescriptionField";

type IdentitySubsectionProps = {
  canClearAgentSelection?: boolean;
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
};

export function IdentitySubsection({
  canClearAgentSelection = true,
  form,
  patchForm,
}: IdentitySubsectionProps) {
  const { t } = usePropertiesTranslation();

  return (
    <CreateFormSection
      hint={t("create.sections.identity.hint")}
      title={t("create.sections.identity.title")}
    >
      <CreateFormField
        htmlFor="property-title"
        isRequired
        label={t("create.fields.title.label")}
      >
        <Input
          className="h-11 border-input px-4 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          id="property-title"
          maxLength={128}
          placeholder={t("create.fields.title.placeholder")}
          value={form.title}
          onChange={(event) => patchForm({ title: event.target.value })}
        />
      </CreateFormField>

      <CreateFormField
        htmlFor="property-agent"
        label={t("create.fields.agent.label")}
      >
        <div id="property-agent">
          <AgentAssignmentSubsection
            agentId={form.agentId}
            canClearSelection={canClearAgentSelection}
            onChange={(agentId) => patchForm({ agentId })}
          />
        </div>
      </CreateFormField>

      <DescriptionField
        value={form.description}
        onChange={(description) => patchForm({ description })}
      />
    </CreateFormSection>
  );
}
