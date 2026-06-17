"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function PropertyShowSkeleton() {
  return (
    <div className="admin-page-view flex min-h-full flex-col gap-8 pb-8">
      <div className="space-y-4 pt-(--admin-page-padding-y)">
        <Skeleton className="h-10 w-36 rounded-full" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-3/5 rounded-full" />
          <Skeleton className="h-5 w-2/5 rounded-full" />
        </div>
      </div>

      <Skeleton className="aspect-[4/3] w-full rounded-[28px]" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-[24px]" />
            ))}
          </div>

          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-28 w-full rounded-[24px]" />
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <Skeleton className="h-48 rounded-[24px]" />
          <Skeleton className="h-72 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}
