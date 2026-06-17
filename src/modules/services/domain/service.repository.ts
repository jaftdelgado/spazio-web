"use client";

import type { ListServicesResult } from "./service.entity";

export interface ServiceRepository {
  listServices(params?: {
    q?: string;
    categoryId?: number;
    page?: number;
    pageSize?: number;
  }): Promise<ListServicesResult>;
}
