"use client";

import type { ListServicesResult } from "./service.entity";

export interface ServiceRepository {
  listServices(params?: {
    q?: string;
    limit?: number;
  }): Promise<ListServicesResult>;
}
