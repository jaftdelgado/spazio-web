"use client";

import type { Key } from "react";

import {
  GridTableIcon,
  Search01Icon,
  TableIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchField, Tabs } from "@heroui/react";
import { PropertiesFiltersPopover } from "./PropertiesFiltersPopover";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

type PropertyTypeOption = {
  propertyTypeId: number;
  name: string;
};

type PropertiesDataGridHeaderProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  propertyTypeOptions: PropertyTypeOption[];
  selectedPropertyTypeIds: number[];
  onSelectedPropertyTypeIdsChange: (value: number[]) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (value: "table" | "grid") => void;
};

export function PropertiesDataGridHeader({
  searchValue,
  onSearchChange,
  propertyTypeOptions,
  selectedPropertyTypeIds,
  onSelectedPropertyTypeIdsChange,
  viewMode,
  onViewModeChange,
}: PropertiesDataGridHeaderProps) {
  const { t } = usePropertiesTranslation();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <SearchField
        className="w-full md:max-w-sm"
        name="properties-search"
        onChange={onSearchChange}
        value={searchValue}
        variant="secondary"
      >
        <SearchField.Group>
          <SearchField.SearchIcon>
            <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.8} />
          </SearchField.SearchIcon>
          <SearchField.Input
            className="w-full"
            placeholder={t("searchPlaceholder")}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      <div className="flex items-center gap-3 self-end md:self-auto">
        <PropertiesFiltersPopover
          onSelectedPropertyTypeIdsChange={onSelectedPropertyTypeIdsChange}
          propertyTypeOptions={propertyTypeOptions}
          selectedPropertyTypeIds={selectedPropertyTypeIds}
        />

        <Tabs
          selectedKey={viewMode}
          variant="primary"
          onSelectionChange={(key: Key) => {
            if (key === "table" || key === "grid") {
              onViewModeChange(key);
            }
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label={t("viewAriaLabel")}>
              <Tabs.Tab id="table">
                <HugeiconsIcon icon={TableIcon} size={16} strokeWidth={1.8} />
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="grid">
                <Tabs.Separator />
                <HugeiconsIcon
                  icon={GridTableIcon}
                  size={16}
                  strokeWidth={1.8}
                />
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>
    </div>
  );
}
