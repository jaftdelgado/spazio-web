"use client";

import { CreateFormSection } from "@properties/components/create/shared/CreateFormPrimitives";
import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "@properties/components/create/types";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { ServiceTagGroupSection } from "./components/ServiceTagGroupSection";
import { ServicesLoadError } from "./components/ServicesLoadError";
import { ServicesStickyHeader } from "./components/ServicesStickyHeader";
import { useServicesSectionState } from "./useServicesSectionState";

type ServicesSectionProps = {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
};

export function ServicesSection({ form, patchForm }: ServicesSectionProps) {
  const { t } = usePropertiesTranslation();
  const {
    availableServices,
    error,
    isError,
    isInitialLoading,
    isSearching,
    searchValue,
    selectedServices,
    selectedServicesQuery,
    servicesQuery,
    setSearchValue,
    shouldShowLoadMore,
    toggleService,
  } = useServicesSectionState({
    form,
    patchForm,
  });

  const availableEmptyText = isSearching
    ? t("create.services.availableSearchEmpty")
    : t("create.services.availableEmpty");

  return (
    <CreateFormSection hideHeader title={t("create.sections.services.title")}>
      {isInitialLoading ? (
        <p className="text-sm text-muted-foreground">
          {t("create.services.loading")}
        </p>
      ) : isError ? (
        <ServicesLoadError
          error={error}
          isRetrying={
            servicesQuery.isRefetching || selectedServicesQuery.isRefetching
          }
          onRetry={() => {
            void servicesQuery.refetch();
            void selectedServicesQuery.refetch();
          }}
        />
      ) : (
        <>
          <ServicesStickyHeader
            isFetchingNextPage={servicesQuery.isFetchingNextPage}
            searchValue={searchValue}
            selectedServices={selectedServices}
            shouldShowLoadMore={shouldShowLoadMore}
            onFetchNextPage={() => {
              if (shouldShowLoadMore) {
                void servicesQuery.fetchNextPage();
              }
            }}
            onSearchChange={setSearchValue}
            onToggleService={toggleService}
          />

          <div className="grid gap-x-10 lg:grid-cols-[190px_minmax(0,1fr)]">
            <div aria-hidden="true" />
            <ServiceTagGroupSection
              emptyText={availableEmptyText}
              mode="available"
              services={availableServices}
              onServiceAdd={toggleService}
              onServiceRemove={toggleService}
            />
          </div>
        </>
      )}
    </CreateFormSection>
  );
}
