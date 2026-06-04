"use client";

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}
