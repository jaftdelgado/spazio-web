"use client";

import { useServices } from "@services/application/hooks/useServices";
import {
  CreateFormSection,
  CreateFormSubsection,
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
      hideHeader
      title={t("create.sections.services.title")}
    >
      {servicesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">
          {t("create.services.loading")}
        </p>
      ) : (
        <>
          <CreateFormSubsection
            isFirst
            hint={t("create.services.selectedHint")}
            title={t("create.services.selectedTitle")}
          >
            <ServiceTagGroupSection
              emptyText={t("create.services.selectedEmpty")}
              mode="selected"
              services={selectedServices}
              onServiceAdd={toggleService}
              onServiceRemove={toggleService}
            />
          </CreateFormSubsection>

          <CreateFormSubsection
            isLast
            hint={t("create.services.availableHint")}
            title={t("create.services.availableTitle")}
          >
            <ServiceTagGroupSection
              emptyText={t("create.services.availableEmpty")}
              mode="available"
              services={availableServices}
              onServiceAdd={toggleService}
              onServiceRemove={toggleService}
            />
          </CreateFormSubsection>
        </>
      )}
    </CreateFormSection>
  );
}
