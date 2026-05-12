"use client";

export class HttpError extends Error {
  public readonly status: number;

  public readonly body: unknown;

  public constructor(status: number, body: unknown, message?: string) {
    super(message ?? `HTTP request failed with status ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}
