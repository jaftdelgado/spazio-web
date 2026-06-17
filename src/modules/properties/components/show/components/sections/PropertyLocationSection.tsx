"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PropertyLocationMap } from "../PropertyLocationMap";
import { PropertyShowSection } from "../common/PropertyShowSection";

type PropertyLocationSectionProps = {
  addressLine: string | null;
  emptyText: string;
  latitude?: number;
  longitude?: number;
  title: string;
};

export function PropertyLocationSection({
  addressLine,
  emptyText,
  latitude,
  longitude,
  title,
}: PropertyLocationSectionProps) {
  const hasCoordinates = latitude !== undefined && longitude !== undefined;

  return (
    <PropertyShowSection title={title}>
      {hasCoordinates ? (
        <div className="space-y-4">
          {addressLine ? (
            <p className="text-[15px] font-normal leading-[1.4] text-muted-foreground">
              {addressLine}
            </p>
          ) : null}
          <PropertyLocationMap latitude={latitude} longitude={longitude} />
        </div>
      ) : (
        <Card className="rounded-[28px] border-0 bg-muted/25 shadow-none ring-0">
          <CardContent className="py-6 text-sm text-muted-foreground">
            {emptyText}
          </CardContent>
        </Card>
      )}
    </PropertyShowSection>
  );
}
