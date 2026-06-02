"use client";

export interface Service {
  serviceId: number;
  code: string;
  icon: string;
  categoryCode: string;
}

export interface ListServicesMeta {
  total: number;
  shown: number;
  query: string | null;
}

export interface ListServicesResult {
  data: Service[];
  meta: ListServicesMeta;
}
