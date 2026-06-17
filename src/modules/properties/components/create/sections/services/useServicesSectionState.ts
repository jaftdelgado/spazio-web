"use client";

import * as React from "react";

import {
  useInfiniteServices,
  useServices,
} from "@services/application/hooks/useServices";

import type {
  PatchPropertyCreateForm,
  PropertyCreateFormState,
} from "../../types";

type UseServicesSectionStateParams = {
  form: PropertyCreateFormState;
  patchForm: PatchPropertyCreateForm;
};

export function useServicesSectionState({
  form,
  patchForm,
}: UseServicesSectionStateParams) {
  const [searchValue, setSearchValue] = React.useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = React.useState("");

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  const normalizedSearchValue = debouncedSearchValue.trim();
  const activeSearchValue =
    normalizedSearchValue.length >= 3 ? normalizedSearchValue : "";

  const servicesQuery = useInfiniteServices(activeSearchValue, 15);
  const selectedServicesQuery = useServices({ page: 1, pageSize: 50 });

  const services = React.useMemo(() => {
    const pages = servicesQuery.data?.pages ?? [];
    const serviceMap = new Map<
      number,
      (typeof pages)[number]["data"][number]
    >();

    for (const page of pages) {
      for (const service of page.data) {
        serviceMap.set(service.serviceId, service);
      }
    }

    return Array.from(serviceMap.values());
  }, [servicesQuery.data]);

  const selectedCatalog = React.useMemo(
    () => selectedServicesQuery.data?.data ?? [],
    [selectedServicesQuery.data?.data],
  );

  const selectedServices = React.useMemo(() => {
    const serviceMap = new Map<number, (typeof services)[number]>();

    for (const service of selectedCatalog) {
      serviceMap.set(service.serviceId, service);
    }

    for (const service of services) {
      serviceMap.set(service.serviceId, service);
    }

    return form.serviceIds.flatMap((serviceId) => {
      const service = serviceMap.get(serviceId);
      return service ? [service] : [];
    });
  }, [form.serviceIds, selectedCatalog, services]);

  const availableServices = React.useMemo(
    () =>
      services.filter(
        (service) => !form.serviceIds.includes(service.serviceId),
      ),
    [form.serviceIds, services],
  );

  const hasServicesData = services.length > 0;
  const isInitialLoading =
    (!hasServicesData && servicesQuery.isLoading) ||
    (form.serviceIds.length > 0 && selectedServicesQuery.isLoading);

  const toggleService = (serviceId: number) => {
    patchForm({
      serviceIds: form.serviceIds.includes(serviceId)
        ? form.serviceIds.filter((currentId) => currentId !== serviceId)
        : [...form.serviceIds, serviceId],
    });
  };

  return {
    availableServices,
    error: servicesQuery.error ?? selectedServicesQuery.error,
    isError: servicesQuery.isError || selectedServicesQuery.isError,
    isInitialLoading,
    isSearching: activeSearchValue !== "",
    searchValue,
    selectedServices,
    selectedServicesQuery,
    servicesQuery,
    setSearchValue,
    shouldShowLoadMore: Boolean(servicesQuery.hasNextPage),
    toggleService,
  };
}
