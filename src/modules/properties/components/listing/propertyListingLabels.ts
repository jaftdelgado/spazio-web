"use client";

type Translate = (key: string) => string;

export function getPropertyTypeLabel(propertyTypeId: number, fallback: string, t: Translate) {
  switch (propertyTypeId) {
    case 1:
      return t("listing.propertyTypes.house");
    case 2:
      return t("listing.propertyTypes.apartment");
    case 3:
      return t("listing.propertyTypes.commercial");
    default:
      return fallback;
  }
}

export function getModalityLabel(modalityId: number, fallback: string, t: Translate) {
  switch (modalityId) {
    case 1:
      return t("listing.modalities.sale");
    case 2:
      return t("listing.modalities.rent");
    case 3:
      return t("listing.modalities.mixed");
    default:
      return fallback;
  }
}

export function getStatusLabel(statusId: number, fallback: string, t: Translate) {
  switch (statusId) {
    case 1:
      return t("listing.statuses.reserved");
    case 2:
      return t("listing.statuses.available");
    case 3:
      return t("listing.statuses.sold");
    case 4:
      return t("listing.statuses.rented");
    case 5:
      return t("listing.statuses.deleted");
    default:
      return fallback;
  }
}
