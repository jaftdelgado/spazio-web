"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { visitsHttpAdapter } from "../../infra/visits.http-adapter";
import type { 
  CreateVisitInput, 
  ListVisitsFilter, 
  RescheduleVisitInput 
} from "../../domain/visits.entity";

export function useVisitsList(filter?: ListVisitsFilter) {
  return useQuery({
    queryKey: ["visits", "list", filter],
    queryFn: () => visitsHttpAdapter.list(filter),
  });
}

export function useAvailableSlots(propertyId: number | null, date?: string) {
  return useQuery({
    queryKey: ["visits", "slots", propertyId, date],
    queryFn: () => visitsHttpAdapter.getAvailableSlots(propertyId!, date),
    enabled: propertyId !== null,
  });
}

export function useVisitsMutations() {
  const queryClient = useQueryClient();

  const scheduleVisit = useMutation({
    mutationFn: (input: CreateVisitInput) => visitsHttpAdapter.schedule(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  const rescheduleVisit = useMutation({
    mutationFn: ({ visitUuid, input }: { visitUuid: string; input: RescheduleVisitInput }) =>
      visitsHttpAdapter.reschedule(visitUuid, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  const confirmVisit = useMutation({
    mutationFn: (visitUuid: string) => visitsHttpAdapter.confirm(visitUuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  const completeVisit = useMutation({
    mutationFn: (visitUuid: string) => visitsHttpAdapter.complete(visitUuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  const cancelVisit = useMutation({
    mutationFn: (visitUuid: string) => visitsHttpAdapter.cancel(visitUuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

  return {
    scheduleVisit,
    rescheduleVisit,
    confirmVisit,
    completeVisit,
    cancelVisit,
  };
}
