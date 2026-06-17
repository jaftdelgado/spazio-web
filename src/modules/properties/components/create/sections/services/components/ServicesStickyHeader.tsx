"use client";

import type { Service } from "@services/domain/service.entity";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";

import { ServiceTagGroupSection } from "./ServiceTagGroupSection";
import { ServicesSearchToolbar } from "./ServicesSearchToolbar";

type ServicesStickyHeaderProps = {
  isFetchingNextPage: boolean;
  searchValue: string;
  selectedServices: Service[];
  shouldShowLoadMore: boolean;
  onFetchNextPage: () => void;
  onSearchChange: (value: string) => void;
  onToggleService: (serviceId: number) => void;
};

export function ServicesStickyHeader({
  isFetchingNextPage,
  searchValue,
  selectedServices,
  shouldShowLoadMore,
  onFetchNextPage,
  onSearchChange,
  onToggleService,
}: ServicesStickyHeaderProps) {
  const { t } = usePropertiesTranslation();

  return (
    <div className="sticky top-[calc(var(--admin-topbar-height)-8px)] z-20 -mx-1 bg-background px-1 pb-4">
      <div className="grid gap-x-10 mb-8 lg:grid-cols-[190px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            {t("create.services.selectedTitle")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("create.services.selectedHint")}
          </p>
        </div>
        <div>
          <ServiceTagGroupSection
            emptyText={t("create.services.selectedEmpty")}
            mode="selected"
            services={selectedServices}
            onServiceAdd={onToggleService}
            onServiceRemove={onToggleService}
          />
        </div>
      </div>

      <div className="grid gap-x-10 border-t border-border pt-8 lg:grid-cols-[190px_minmax(0,1fr)]">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            {t("create.services.availableTitle")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t("create.services.availableHint")}
          </p>
        </div>
        <ServicesSearchToolbar
          isFetchingNextPage={isFetchingNextPage}
          searchValue={searchValue}
          shouldShowLoadMore={shouldShowLoadMore}
          onFetchNextPage={onFetchNextPage}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
}
