"use client";

type Env = {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_DEV_BEARER_TOKEN: string;
};

export const env: Env = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  NEXT_PUBLIC_DEV_BEARER_TOKEN: process.env.NEXT_PUBLIC_DEV_BEARER_TOKEN ?? "",
};
