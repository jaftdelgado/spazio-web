"use client";

import type { ReactNode } from "react";

type PageWrapperProps = {
  children?: ReactNode;
};

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div>
      {children}
      {/* PageWrapper */}
    </div>
  );
}
