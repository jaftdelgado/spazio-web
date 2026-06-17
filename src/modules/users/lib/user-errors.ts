"use client";

import { HttpError } from "@lib/http/http-errors";

export function getUserErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof HttpError) {
    const body = error.body as { error?: string } | null;
    return body?.error ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
