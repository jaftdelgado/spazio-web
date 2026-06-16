"use client";

import * as React from "react";

export function SelectEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
