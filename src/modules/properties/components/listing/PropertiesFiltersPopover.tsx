"use client";

import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { getPropertyTypeLabel } from "./propertyListingLabels";

type PropertyTypeOption = {
  propertyTypeId: number;
  name: string;
};

type PropertiesFiltersPopoverProps = {
  propertyTypeOptions: PropertyTypeOption[];
  selectedPropertyTypeId: number | null;
  onSelectedPropertyTypeIdChange: (value: number | null) => void;
};

export function PropertiesFiltersPopover({
  propertyTypeOptions,
  selectedPropertyTypeId,
  onSelectedPropertyTypeIdChange,
}: PropertiesFiltersPopoverProps) {
  const { t } = usePropertiesTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-10 rounded-2xl" type="button" variant="outline">
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            size={16}
            strokeWidth={1.8}
          />
          <span>{t("filters.propertyTypeButton")}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-foreground">
            {t("filters.propertyTypeTitle")}
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("create.sections.propertyType.hint")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              selectedPropertyTypeId === null
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
            type="button"
            onClick={() => onSelectedPropertyTypeIdChange(null)}
          >
            {t("filters.all")}
          </button>

          {propertyTypeOptions.map((propertyType) => {
            const isSelected = selectedPropertyTypeId === propertyType.propertyTypeId;

            return (
              <button
                key={propertyType.propertyTypeId}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  isSelected
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
                type="button"
                onClick={() => {
                  onSelectedPropertyTypeIdChange(
                    isSelected ? null : propertyType.propertyTypeId,
                  );
                }}
              >
                {getPropertyTypeLabel(
                  propertyType.propertyTypeId,
                  propertyType.name,
                  t,
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
