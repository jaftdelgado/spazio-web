"use client";

import type { ReactNode } from "react";

type AppModalProps = {
  children?: ReactNode;
};

export function AppModal({ children }: AppModalProps) {
  return (
    <div>
      {children}
      {/* AppModal */}
    </div>
  );
}
