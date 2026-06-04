"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import {
  AuthShellFooter,
} from "@users/components/shell/AuthShellFooter";
import {
  AuthShellHeader,
  type AuthShellHeaderProps,
} from "@users/components/shell/AuthShellHeader";
import { useUsersTranslation } from "@users/i18n/useUsersTranslation";

type AuthShellProps = {
  children: ReactNode;
  header: AuthShellHeaderProps;
};

export function AuthShell({ children, header }: AuthShellProps) {
  return (
    <main className="grid min-h-svh grid-cols-1 overflow-hidden lg:grid-cols-[1fr_minmax(440px,520px)]">
      <LeftPanel />
      <RightPanel header={header}>{children}</RightPanel>
    </main>
  );
}

function LeftPanel() {
  const { t } = useUsersTranslation();

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

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_8%,rgba(10,10,15,0.42)_62%,rgba(10,10,15,0.86)_100%)]" />

      <div className="absolute bottom-12 left-12 max-w-sm">
        <p className="text-4xl font-semibold tracking-tight text-white">
          Spazio
        </p>
        <p className="mt-3 text-sm leading-6 text-white/55">
          {t("auth.shell.tagline")}
        </p>
      </div>
    </div>
  );
}

function RightPanel({
  children,
  header,
}: {
  children: ReactNode;
  header: AuthShellHeaderProps;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-6 py-12 sm:px-10">
      <AuthShellHeader header={header} />
      <AuthShellFooter />

      <div className="w-full max-w-130 pt-20 pb-20">
        <div className="mx-auto w-full max-w-90">
          <div className="mb-8 text-center">
            <p className="text-[28px] font-semibold tracking-tight text-foreground">
              Spazio
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
