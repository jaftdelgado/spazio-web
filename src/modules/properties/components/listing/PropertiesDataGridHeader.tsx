"use client";

import {
  Cancel01Icon,
  GridTableIcon,
  Search01Icon,
  TableIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import { PropertiesFiltersPopover } from "./PropertiesFiltersPopover";

type PropertyTypeOption = {
  propertyTypeId: number;
  name: string;
};

type PropertiesDataGridHeaderProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  propertyTypeOptions: PropertyTypeOption[];
  selectedPropertyTypeId: number | null;
  onSelectedPropertyTypeIdChange: (value: number | null) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (value: "table" | "grid") => void;
};

export function PropertiesDataGridHeader({
  searchValue,
  onSearchChange,
  propertyTypeOptions,
  selectedPropertyTypeId,
  onSelectedPropertyTypeIdChange,
  viewMode,
  onViewModeChange,
}: PropertiesDataGridHeaderProps) {
  const { t } = usePropertiesTranslation();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm">
        <HugeiconsIcon
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          icon={Search01Icon}
          size={16}
          strokeWidth={1.8}
        />
        <Input
          aria-label={t("searchPlaceholder")}
          className="h-11 rounded-2xl border-input bg-background px-10 text-[15px] shadow-none focus-visible:border-ring focus-visible:ring-ring/30"
          name="properties-search"
          placeholder={t("searchPlaceholder")}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {searchValue ? (
          <Button
            aria-label={t("searchPlaceholder")}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-2xl"
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={() => onSearchChange("")}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={1.8} />
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-3 self-end md:self-auto">
        <PropertiesFiltersPopover
          onSelectedPropertyTypeIdChange={onSelectedPropertyTypeIdChange}
          propertyTypeOptions={propertyTypeOptions}
          selectedPropertyTypeId={selectedPropertyTypeId}
        />

        <Tabs
          value={viewMode}
          onValueChange={(value) => onViewModeChange(value as "table" | "grid")}
        >
          <TabsList
            aria-label={t("viewAriaLabel")}
            className="rounded-2xl border border-border/70 bg-muted/20 p-1"
          >
            {[
              { id: "table", icon: TableIcon },
              { id: "grid", icon: GridTableIcon },
            ].map((option) => (
              <TabsTrigger
                key={option.id}
                value={option.id}
                className={cn("h-9 rounded-xl px-3 data-active:shadow-sm")}
              >
                <HugeiconsIcon
                  icon={option.icon}
                  size={16}
                  strokeWidth={1.8}
                />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
