"use client";

export const AUTH_SESSION_CHANGED_EVENT = "spazio:auth-session-changed";

export const auth = {
  notifySessionChanged(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  },
};
