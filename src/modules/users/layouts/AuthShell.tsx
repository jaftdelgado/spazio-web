"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative grid min-h-svh grid-cols-1 overflow-hidden lg:grid-cols-[1fr_minmax(440px,520px)]">
      <PageBackdrop />
      <LeftPanel />
      <RightPanel>{children}</RightPanel>
    </main>
  );
}

function PageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[#f0f0f5]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_transparent_48%),radial-gradient(circle_at_bottom_right,_rgba(222,225,238,0.65),_transparent_34%)]" />
    </div>
  );
}

function LeftPanel() {
  return (
    <div className="relative hidden min-h-svh overflow-hidden bg-[#0a0a0f] lg:block">
      <motion.div
        aria-hidden="true"
        className="absolute inset-[-12%] transform-gpu opacity-90 will-change-transform"
        animate={{
          x: [0, 18, 0],
          y: [0, -12, 0],
          scale: [1, 1.04, 1],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(94, 118, 255, 0.32), transparent 32%), radial-gradient(circle at 80% 30%, rgba(62, 180, 255, 0.18), transparent 28%), radial-gradient(circle at 50% 80%, rgba(121, 71, 255, 0.22), transparent 34%)",
          backgroundSize: "130% 130%",
          willChange: "transform",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_8%,_rgba(10,10,15,0.42)_62%,_rgba(10,10,15,0.86)_100%)]" />

      <div className="absolute bottom-12 left-12 max-w-sm">
        <p className="text-4xl font-semibold tracking-tight text-white">
          Spazio
        </p>
        <p className="mt-3 text-sm leading-6 text-white/55">
          Gestión inmobiliaria, simplificada.
        </p>
      </div>
    </div>
  );
}

function RightPanel({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-white px-6 py-12 sm:px-10">
      <div className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <p className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">
            Spazio
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
