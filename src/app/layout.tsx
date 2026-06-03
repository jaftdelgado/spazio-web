"use client";

import type { ReactNode } from "react";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";

import { Toast } from "@heroui/react";

import { DEFAULT_LOCALE } from "@/app/i18n/config";
import { I18nProvider } from "@/app/i18n/I18nProvider";
import { Navbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AppQueryClientProvider } from "@lib/query/query-client-provider";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/Geist.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  return (
    <html
      lang={DEFAULT_LOCALE}
      className={geistSans.variable}
      suppressHydrationWarning
    >
      <body className={geistSans.className}>
        <I18nProvider>
          <AppQueryClientProvider>
            <Toast.Provider placement="bottom" />
            {isAuthRoute ? (
              children
            ) : (
              <>
                <Navbar />
                <PageWrapper>{children}</PageWrapper>
              </>
            )}
          </AppQueryClientProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
