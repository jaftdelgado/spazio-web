export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface VisitEntity {
  visitUuid: string;
  propertyId: number;
  propertyTitle: string;
  agentId: number;
  agentName: string;
  agentPhone: string;
  visitDate: string;
  status: string;
  createdAt: string;
  clientName: string;
  clientPhone: string;
  cityName: string;
  address: string;
}

export interface CreateVisitInput {
  propertyId: number;
  visitDate: string;
}

export interface RescheduleVisitInput {
  propertyId: number; // Required by backend validation
  visitDate: string;
}

export interface ListVisitsFilter {
  date?: string;
  statusId?: number;
  propertyId?: number;
}
