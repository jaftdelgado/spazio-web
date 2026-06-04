import type { 
  VisitEntity, 
  TimeSlot, 
  CreateVisitInput, 
  RescheduleVisitInput,
  ListVisitsFilter 
} from "./visits.entity";

export interface VisitsRepository {
  list(filter?: ListVisitsFilter): Promise<VisitEntity[]>;
  getAvailableSlots(propertyId: number, date?: string): Promise<TimeSlot[]>;
  schedule(input: CreateVisitInput): Promise<VisitEntity>;
  reschedule(visitUuid: string, input: RescheduleVisitInput): Promise<VisitEntity>;
  confirm(visitUuid: string): Promise<void>;
  complete(visitUuid: string): Promise<void>;
  cancel(visitUuid: string): Promise<void>;
}
