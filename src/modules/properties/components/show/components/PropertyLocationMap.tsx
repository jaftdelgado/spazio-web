"use client";

import * as React from "react";
import maplibregl from "maplibre-gl";
import {
  Map,
  Marker,
  NavigationControl,
  type MapRef,
} from "@vis.gl/react-maplibre";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/bright";
const TRANSPARENT_IMAGE = {
  data: new Uint8Array([0, 0, 0, 0]),
  height: 1,
  width: 1,
};

type PropertyLocationMapProps = {
  latitude: number;
  longitude: number;
};

export function PropertyLocationMap({
  latitude,
  longitude,
}: PropertyLocationMapProps) {
  const mapRef = React.useRef<MapRef | null>(null);

  React.useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.flyTo({
      center: [longitude, latitude],
      duration: 500,
      zoom: 14,
    });
  }, [latitude, longitude]);

  return (
    <div className="overflow-hidden rounded-[28px] border border-border/60 bg-transparent">
      <Map
        ref={mapRef}
        attributionControl={false}
        dragRotate={false}
        initialViewState={{
          latitude,
          longitude,
          zoom: 14,
        }}
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        style={{ height: 420, width: "100%" }}
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
        <Marker latitude={latitude} longitude={longitude} color="#111827" />
      </Map>
    </div>
  );
}
