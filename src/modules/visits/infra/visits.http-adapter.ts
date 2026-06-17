import { httpClient } from "@lib/http/http-client";
import type { 
  CreateVisitInput, 
  RescheduleVisitInput,
  ListVisitsFilter 
} from "../domain/visits.entity";
import type { VisitsRepository } from "../domain/visits.repository";
import { mapVisit, mapTimeSlot } from "./visits.mapper";

type VisitResponse = {
  visit_uuid: string;
  property_id: number;
  property_title?: string | null;
  agent_id: number;
  agent_name?: string | null;
  agent_phone?: string | null;
  visit_date: string;
  status: string;
  created_at: string;
  client_name?: string | null;
  client_phone?: string | null;
  city_name?: string | null;
  address?: string | null;
};

type TimeSlotResponse = {
  start_time: string;
  end_time: string;
  available: boolean;
};

export const visitsHttpAdapter = {
  list: async (filter?: ListVisitsFilter) => {
    const params = new URLSearchParams();
    if (filter?.date) params.append("date", filter.date);
    if (filter?.statusId) params.append("status_id", filter.statusId.toString());
    if (filter?.propertyId) params.append("property_id", filter.propertyId.toString());

    const queryString = params.toString();
    const url = `/api/v1/visits${queryString ? `?${queryString}` : ""}`;
    
    const response = await httpClient.get<VisitResponse[]>(url);
    return (response || []).map(mapVisit);
  },

  getAvailableSlots: async (propertyId: number, date?: string) => {
    const url = `/api/v1/properties/${propertyId}/availability${date ? `?date=${date}` : ""}`;
    const response = await httpClient.get<TimeSlotResponse[]>(url);
    return response.map(mapTimeSlot);
  },

  schedule: async (input: CreateVisitInput) => {
    const response = await httpClient.post<VisitResponse>("/api/v1/visits", {
      property_id: input.propertyId,
      visit_date: input.visitDate,
    });
    return mapVisit(response);
  },

  reschedule: async (visitUuid: string, input: RescheduleVisitInput) => {
    const response = await httpClient.patch<VisitResponse>(`/api/v1/visits/${visitUuid}/reschedule`, {
      property_id: input.propertyId,
      visit_date: input.visitDate,
    });
    return mapVisit(response);
  },

  confirm: async (visitUuid: string) => {
    await httpClient.patch<void>(`/api/v1/visits/${visitUuid}/confirm`, {});
  },

  complete: async (visitUuid: string) => {
    await httpClient.patch<void>(`/api/v1/visits/${visitUuid}/complete`, {});
  },

  cancel: async (visitUuid: string) => {
    await httpClient.patch<void>(`/api/v1/visits/${visitUuid}/cancel`, {});
  },
} satisfies VisitsRepository;
