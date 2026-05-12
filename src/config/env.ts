"use client";

type Env = {
  NEXT_PUBLIC_API_URL: string;
};

export const env: Env = {
  NEXT_PUBLIC_API_URL:
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
};
