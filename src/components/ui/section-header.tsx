import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function SectionHeader({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-6 space-y-1", className)}>
      <h2
        className={cn(
          "text-xl font-medium tracking-tight text-foreground",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
