"use client";

import {
  BathIcon,
  BedBunkIcon,
  Building03Icon,
  Calendar03Icon,
  BedDoubleIcon,
  OrientationPotraitToLandscapeIcon,
  Note01Icon,
  ParkingAreaCircleIcon,
  RulerIcon,
  WarehouseIcon,
} from "@hugeicons/core-free-icons";

import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { formatPropertyArea } from "./property-show.helpers";
import type { PropertyShowFactItem } from "./types";
import { usePropertyShowResource } from "./usePropertyShowResource";

type PropertyDetail = NonNullable<
  ReturnType<typeof usePropertyShowResource>["detailQuery"]["data"]
>;

type PropertyTranslator = ReturnType<typeof usePropertiesTranslation>["t"];

export function buildPropertyFactItems(
  t: PropertyTranslator,
  locale: string,
  detail: PropertyDetail,
  orientationLabel: string | null,
): PropertyShowFactItem[] {
  const facts: PropertyShowFactItem[] = [];

  if (detail.residential) {
    facts.push(
      {
        key: "bedrooms",
        icon: BedBunkIcon,
        label: t("create.fields.bedrooms.label"),
        value: String(detail.residential.bedrooms),
      },
      {
        key: "bathrooms",
        icon: BathIcon,
        label: t("create.fields.bathrooms.label"),
        value: String(detail.residential.bathrooms),
      },
      {
        key: "beds",
        icon: BedDoubleIcon,
        label: t("create.fields.beds.label"),
        value: String(detail.residential.beds),
      },
      {
        key: "parkingSpots",
        icon: ParkingAreaCircleIcon,
        label: t("create.fields.parkingSpots.label"),
        value: String(detail.residential.parkingSpots),
      },
      {
        key: "builtArea",
        icon: WarehouseIcon,
        label: t("create.fields.builtArea.label"),
        value: formatPropertyArea(detail.residential.builtArea, locale),
      },
      {
        key: "floors",
        icon: Building03Icon,
        label: t("create.fields.floors.label"),
        value: String(detail.residential.floors),
      },
      {
        key: "constructionYear",
        icon: Calendar03Icon,
        label: t("create.fields.constructionYear.label"),
        value: String(detail.residential.constructionYear),
      },
      {
        key: "orientation",
        icon: OrientationPotraitToLandscapeIcon,
        label: t("create.fields.orientation.label"),
        value: orientationLabel ?? t("show.values.notAvailable"),
      },
    );
  }

  if (detail.commercial) {
    facts.push(
      {
        key: "ceilingHeight",
        icon: Building03Icon,
        label: t("create.fields.ceilingHeight.label"),
        value: detail.commercial.ceilingHeight.toString(),
      },
      {
        key: "loadingDocks",
        icon: WarehouseIcon,
        label: t("create.fields.loadingDocks.label"),
        value: detail.commercial.loadingDocks.toString(),
      },
      {
        key: "internalOffices",
        icon: Note01Icon,
        label: t("create.fields.internalOffices.label"),
        value: detail.commercial.internalOffices.toString(),
      },
    );
  }

  facts.push({
    key: "lotArea",
    icon: RulerIcon,
    label: t("create.fields.lotArea.label"),
    value: formatPropertyArea(detail.lotArea, locale),
  });

  return facts;
}

export function getFriendlyPropertyErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return "No pudimos conectarnos en este momento. Revisa tu conexion e intenta nuevamente.";
  }

  return "No fue posible cargar la propiedad por ahora. Intenta de nuevo en un momento.";
}
