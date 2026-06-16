"use client";

const EDITING_PROPERTY_UUID_KEY = "spazio:properties:editing-uuid";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveEditingPropertyUuid(propertyUuid: string) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(EDITING_PROPERTY_UUID_KEY, propertyUuid);
}

export function readEditingPropertyUuid() {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage.getItem(EDITING_PROPERTY_UUID_KEY);
}

export function clearEditingPropertyUuid() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(EDITING_PROPERTY_UUID_KEY);
}
