import type { VisitEntity, TimeSlot } from "../domain/visits.entity";

export function mapVisit(data: any): VisitEntity {
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

export function mapTimeSlot(data: any): TimeSlot {
  return {
    startTime: data.start_time,
    endTime: data.end_time,
    available: data.available,
  };
}
