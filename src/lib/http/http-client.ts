"use client";

import { env } from "@/config/env";

import { HttpError } from "./http-errors";

type HttpMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

type RequestOptions = {
  body?: unknown;
  method: HttpMethod;
};

const buildUrl = (path: string) => {
  return new URL(path, env.NEXT_PUBLIC_API_URL).toString();
};

const parseResponseBody = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  if (contentType?.includes("application/json")) {
    return JSON.parse(text) as unknown;
  }

  return text;
};

const request = async <T>(
  path: string,
  options: RequestOptions,
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const url = buildUrl(path);

  const response = await fetch(url, {
    method: options.method,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw new HttpError(response.status, responseBody);
  }

  return responseBody as T;
};

export const httpClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "DELETE", body }),
};
