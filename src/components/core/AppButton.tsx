"use client";

import type { ReactNode } from "react";

type AppButtonProps = {
  children?: ReactNode;
};

export function AppButton({ children }: AppButtonProps) {
  return (
    <div>
      {children}
      {/* AppButton */}
    </div>
  );
}
