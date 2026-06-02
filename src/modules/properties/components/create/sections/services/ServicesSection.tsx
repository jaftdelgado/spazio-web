"use client";

import { Description } from "@heroui/react";

import { useServices } from "@services/application/hooks/useServices";
import {
  CreateFormSection,
} from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { ServiceTagGroupSection } from "./components/ServiceTagGroupSection";

export function ServicesSection({
  form,
  patchForm,
}: {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
}) {
  const { t } = usePropertiesTranslation();
  const servicesQuery = useServices();

  const services = servicesQuery.data?.data ?? [];
  const selectedServices = services.filter((service) =>
    form.serviceIds.includes(service.serviceId),
  );
  const availableServices = services.filter(
    (service) => !form.serviceIds.includes(service.serviceId),
  );

  const toggleService = (serviceId: number) => {
    patchForm({
      serviceIds: form.serviceIds.includes(serviceId)
        ? form.serviceIds.filter((currentId) => currentId !== serviceId)
        : [...form.serviceIds, serviceId],
    });
  };

  return (
    <CreateFormSection
      hint={t("create.sections.services.hint")}
      title={t("create.sections.services.title")}
    >
      {servicesQuery.isLoading ? (
        <Description>{t("create.services.loading")}</Description>
      ) : (
        <div className="flex flex-col gap-6">
          <ServiceTagGroupSection
            emptyText={t("create.services.selectedEmpty")}
            hint={t("create.services.selectedHint")}
            mode="selected"
            services={selectedServices}
            title={t("create.services.selectedTitle")}
            onServiceAdd={toggleService}
            onServiceRemove={toggleService}
          />
          <ServiceTagGroupSection
            emptyText={t("create.services.availableEmpty")}
            hint={t("create.services.availableHint")}
            mode="available"
            services={availableServices}
            title={t("create.services.availableTitle")}
            onServiceAdd={toggleService}
            onServiceRemove={toggleService}
          />
        </div>
      )}
    </CreateFormSection>
  );
}
