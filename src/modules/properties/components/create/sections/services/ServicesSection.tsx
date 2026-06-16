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

function getServicesErrorMessage(error: unknown) {
  if (error instanceof HttpError) {
    if (error.status === 401 || error.status === 403) {
      return "Tu sesion ya no permite cargar los servicios. Vuelve a iniciar sesion e intentalo de nuevo.";
    }

    if (error.status >= 500) {
      return "No pudimos cargar los servicios disponibles por un problema del servidor. Intentalo nuevamente en unos minutos.";
    }
  }

  return "No pudimos cargar los servicios disponibles para esta propiedad.";
}

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
      ) : servicesQuery.isError ? (
        <Empty className="min-h-40 rounded-3xl border border-dashed border-border bg-card px-6 py-8">
          <EmptyHeader>
            <EmptyMedia className="bg-destructive/10 text-destructive" variant="icon">
              <HugeiconsIcon icon={Alert02Icon} size={20} strokeWidth={1.8} />
            </EmptyMedia>
            <EmptyTitle>{t("states.loadErrorTitle")}</EmptyTitle>
            <EmptyDescription className="max-w-lg">
              {getServicesErrorMessage(servicesQuery.error)}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              className="rounded-2xl"
              disabled={servicesQuery.isRefetching}
              size="sm"
              type="button"
              onClick={() => {
                void servicesQuery.refetch();
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
