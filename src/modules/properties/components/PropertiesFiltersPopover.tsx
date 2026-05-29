"use client";

import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button, Popover, Tag, TagGroup } from "@heroui/react";
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

  return (
    <Popover>
      <Popover.Trigger>
        <Button variant="outline">
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            size={16}
            strokeWidth={1.8}
          />
          <span>{t("filters.propertyTypeButton")}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-[320px]" placement="bottom end">
        <Popover.Dialog className="space-y-3 p-4">
          <Popover.Heading className="text-sm font-medium text-foreground">
            {t("filters.propertyTypeTitle")}
          </Popover.Heading>
          <TagGroup
            selectedKeys={new Set(selectedPropertyTypeIds.map(String))}
            selectionMode="multiple"
            onSelectionChange={(keys) => {
              const nextPropertyTypeIds =
                keys === "all"
                  ? allPropertyTypeIds
                  : propertyTypeOptions
                      .filter((propertyType) =>
                        keys.has(String(propertyType.propertyTypeId)),
                      )
                      .map((propertyType) => propertyType.propertyTypeId);

              onSelectedPropertyTypeIdsChange(nextPropertyTypeIds);
            }}
            variant="surface"
          >
            <TagGroup.List className="gap-2">
              {propertyTypeOptions.map((propertyType) => (
                <Tag
                  key={propertyType.propertyTypeId}
                  id={String(propertyType.propertyTypeId)}
                  textValue={propertyType.name}
                >
                  {propertyType.name}
                </Tag>
              ))}
            </TagGroup.List>
          </TagGroup>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
