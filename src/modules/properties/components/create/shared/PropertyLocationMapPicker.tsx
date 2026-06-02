"use client";

import * as React from "react";
import { MapsLocation01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Description } from "@heroui/react";
import maplibregl from "maplibre-gl";
import {
  Map,
  Marker,
  NavigationControl,
  type MapRef,
} from "@vis.gl/react-maplibre";

import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

const DEFAULT_CENTER = {
  latitude: 19.4326,
  longitude: -99.1332,
  zoom: 11,
};
const SELECTED_LOCATION_ZOOM = 15;
const MAP_STYLE = "https://tiles.openfreemap.org/styles/bright";
const TRANSPARENT_IMAGE = {
  data: new Uint8Array([0, 0, 0, 0]),
  height: 1,
  width: 1,
};

function toCoordinate(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : null;
}

export function PropertyLocationMapPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string;
  longitude: string;
  onChange: (next: { latitude: string; longitude: string }) => void;
}) {
  const { t } = usePropertiesTranslation();
  const mapRef = React.useRef<MapRef | null>(null);
  const hasInitializedLocationRef = React.useRef(false);

  const selectedLatitude = toCoordinate(latitude);
  const selectedLongitude = toCoordinate(longitude);

  const selectedCoordinates = React.useMemo(() => {
    if (selectedLatitude === null || selectedLongitude === null) {
      return null;
    }

    return {
      latitude: selectedLatitude,
      longitude: selectedLongitude,
    };
  }, [selectedLatitude, selectedLongitude]);

  React.useEffect(() => {
    if (hasInitializedLocationRef.current || selectedCoordinates) {
      return;
    }

    hasInitializedLocationRef.current = true;

    if (!navigator.geolocation) {
      onChange({
        latitude: DEFAULT_CENTER.latitude.toFixed(6),
        longitude: DEFAULT_CENTER.longitude.toFixed(6),
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
      },
      () => {
        onChange({
          latitude: DEFAULT_CENTER.latitude.toFixed(6),
          longitude: DEFAULT_CENTER.longitude.toFixed(6),
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300_000,
        timeout: 10_000,
      },
    );
  }, [onChange, selectedCoordinates]);

  React.useEffect(() => {
    if (!selectedCoordinates || !mapRef.current) {
      return;
    }

    mapRef.current.flyTo({
      center: [selectedCoordinates.longitude, selectedCoordinates.latitude],
      duration: 500,
      zoom: Math.max(mapRef.current.getZoom(), SELECTED_LOCATION_ZOOM),
    });
  }, [selectedCoordinates]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      <Map
        ref={mapRef}
        dragRotate={false}
        initialViewState={
          selectedCoordinates
            ? {
                latitude: selectedCoordinates.latitude,
                longitude: selectedCoordinates.longitude,
                zoom: SELECTED_LOCATION_ZOOM,
              }
            : DEFAULT_CENTER
        }
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        style={{ height: 288, width: "100%" }}
        onClick={(event) => {
          onChange({
            latitude: event.lngLat.lat.toFixed(6),
            longitude: event.lngLat.lng.toFixed(6),
          });
        }}
        onLoad={() => {
          const map = mapRef.current?.getMap();

          if (!map) {
            return;
          }

          map.on("styleimagemissing", (event) => {
            if (map.hasImage(event.id)) {
              return;
            }

            map.addImage(event.id, TRANSPARENT_IMAGE);
          });
        }}
      >
        <NavigationControl position="top-right" />
        {selectedCoordinates ? (
          <Marker
            color="#0f172a"
            draggable
            latitude={selectedCoordinates.latitude}
            longitude={selectedCoordinates.longitude}
            onDragEnd={(event) => {
              onChange({
                latitude: event.lngLat.lat.toFixed(6),
                longitude: event.lngLat.lng.toFixed(6),
              });
            }}
          />
        ) : null}
      </Map>
      <div className="border-t border-slate-200/80 px-4 py-3">
        <div className="flex items-start gap-2">
          <HugeiconsIcon
            className="mt-0.5 shrink-0 text-muted"
            icon={MapsLocation01Icon}
            size={16}
            strokeWidth={1.8}
          />
          <Description className="text-xs leading-relaxed">
            {selectedCoordinates
              ? t("create.fields.locationMap.coordinatesSelected", {
                  latitude: selectedCoordinates.latitude.toFixed(6),
                  longitude: selectedCoordinates.longitude.toFixed(6),
                })
              : t("create.fields.locationMap.loadingLocation")}
          </Description>
        </div>
      </div>
    </div>
  );
}
