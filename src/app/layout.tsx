"use client";

import type { ReactNode } from "react";

import { Toast } from "@heroui/react";

import { DEFAULT_LOCALE } from "@/app/i18n/config";
import { I18nProvider } from "@/app/i18n/I18nProvider";
import { Navbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AppQueryClientProvider } from "@lib/query/query-client-provider";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body>
        <I18nProvider>
          <AppQueryClientProvider>
            <Toast.Provider placement="bottom" />
            <Navbar />
            <PageWrapper>{children}</PageWrapper>
          </AppQueryClientProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
