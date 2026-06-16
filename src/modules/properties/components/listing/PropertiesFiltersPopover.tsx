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

type PropertyTypeOption = {
  propertyTypeId: number;
  name: string;
};

type PropertiesFiltersPopoverProps = {
  propertyTypeOptions: PropertyTypeOption[];
  selectedPropertyTypeIds: number[];
  onSelectedPropertyTypeIdsChange: (value: number[]) => void;
};

export function PropertiesFiltersPopover({
  propertyTypeOptions,
  selectedPropertyTypeIds,
  onSelectedPropertyTypeIdsChange,
}: PropertiesFiltersPopoverProps) {
  const { t } = usePropertiesTranslation();
  const allPropertyTypeIds = propertyTypeOptions.map(
    (propertyType) => propertyType.propertyTypeId,
  );
  const allSelected =
    propertyTypeOptions.length > 0 &&
    selectedPropertyTypeIds.length === propertyTypeOptions.length;

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
              allSelected
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
            type="button"
            onClick={() => onSelectedPropertyTypeIdsChange(allPropertyTypeIds)}
          >
            {t("filters.all")}
          </button>

          {propertyTypeOptions.map((propertyType) => {
            const isSelected = selectedPropertyTypeIds.includes(
              propertyType.propertyTypeId,
            );

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
                  const nextIds = isSelected
                    ? selectedPropertyTypeIds.filter(
                        (id) => id !== propertyType.propertyTypeId,
                      )
                    : [...selectedPropertyTypeIds, propertyType.propertyTypeId];

                  onSelectedPropertyTypeIdsChange(nextIds);
                }}
              >
                {propertyType.name}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
