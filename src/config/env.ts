"use client";

type Env = {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_R2_PUBLIC_BASE_URL: string;
};

const fallbackApiHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

export const env: Env = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? `http://${fallbackApiHost}:8080`,
  NEXT_PUBLIC_R2_PUBLIC_BASE_URL:
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ??
    "https://pub-ab9b26339b564d53b2f5ec019d1ca830.r2.dev",
};
