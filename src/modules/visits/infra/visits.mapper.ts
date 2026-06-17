import type { VisitEntity, TimeSlot } from "../domain/visits.entity";

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

export function mapVisit(data: VisitResponse): VisitEntity {
  return {
    visitUuid: data.visit_uuid,
    propertyId: data.property_id,
    propertyTitle: data.property_title || "",
    agentId: data.agent_id,
    agentName: data.agent_name || "",
    agentPhone: data.agent_phone || "",
    visitDate: data.visit_date,
    status: data.status,
    createdAt: data.created_at,
    clientName: data.client_name || "",
    clientPhone: data.client_phone || "",
    cityName: data.city_name || "",
    address: data.address || "",
  };
}

export function mapTimeSlot(data: TimeSlotResponse): TimeSlot {
  return {
    startTime: data.start_time,
    endTime: data.end_time,
    available: data.available,
  };
}
