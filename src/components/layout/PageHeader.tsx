import type { ReactNode } from "react";

import { SectionHeader } from "@/components/ui/section-header";

type PageHeaderProps = Readonly<{
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}>;

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="border-b border-border/60 pb-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeader
          title={title}
          description={description}
          className="mb-0 space-y-1"
          titleClassName="text-2xl font-semibold"
        />

        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
