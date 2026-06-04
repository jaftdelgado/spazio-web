"use client";

const ACCESS_TOKEN_KEY = "spazio:access-token";
const REFRESH_TOKEN_KEY = "spazio:refresh-token";

export const authStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearTokens(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
