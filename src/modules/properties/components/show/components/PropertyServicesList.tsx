"use client";

import { HugeiconsIcon } from "@hugeicons/react";

import { resolveServiceIcon } from "@properties/components/create/sections/services/components/resolveServiceIcon";
import { usePropertiesTranslation } from "@properties/i18n/usePropertiesTranslation";
import type { Service } from "@services/domain/service.entity";
import { useServicesTranslation } from "@services/i18n/useServicesTranslation";

type PropertyServicesListProps = {
  isLoading: boolean;
  services: Service[];
};

export function PropertyServicesList({
  isLoading,
  services,
}: PropertyServicesListProps) {
  const { t } = usePropertiesTranslation();
  const { tService } = useServicesTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-x-6 gap-y-5 bg-transparent max-md:grid-cols-2 max-[480px]:grid-cols-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="flex items-center gap-3 bg-transparent py-[10px]"
          >
            <div className="size-7 shrink-0" />
            <div className="h-[21px] w-full max-w-[180px]" />
          </div>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <p className="py-[10px] text-[15px] font-normal leading-[1.4] text-[#222222]">
        {t("show.servicesEmpty")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-5 bg-transparent max-md:grid-cols-2 max-[480px]:grid-cols-1">
      {services.map((service) => (
        <div
          key={service.serviceId}
          className="flex items-center gap-3 border-0 bg-transparent py-[10px] shadow-none"
        >
          <div className="flex size-7 shrink-0 items-center justify-center text-[#222222] [&_svg]:size-7 [&_svg]:fill-none [&_svg]:stroke-current">
            <HugeiconsIcon
              icon={resolveServiceIcon(service.icon)}
              size={28}
              strokeWidth={1.8}
            />
          </div>
          <p className="m-0 text-[15px] font-normal leading-[1.4] text-[#222222]">
            {tService(service.code)}
          </p>
        </div>
      ))}
    </div>
  );
}
