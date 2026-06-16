"use client";

type Env = {
  NEXT_PUBLIC_API_URL: string;
};

const fallbackApiHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

export const env: Env = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? `http://${fallbackApiHost}:8080`,
};
