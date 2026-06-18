"use client";

import type { ReactNode } from "react";
import localFont from "next/font/local";
import { usePathname } from "next/navigation";

import { FontProvider } from "@/app/font/FontProvider";
import { DEFAULT_LOCALE } from "@/app/i18n/config";
import { I18nProvider } from "@/app/i18n/I18nProvider";
import { ThemeProvider } from "@/app/theme/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { AppQueryClientProvider } from "@lib/query/query-client-provider";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/Geist.woff2",
  variable: "--font-geist-sans",
  display: "swap",
});

const openDyslexic = localFont({
  src: "./fonts/OpenDyslexic-Regular.woff",
  variable: "--font-open-dyslexic",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");
  const isExploreRoute = pathname.startsWith("/explore");
  const isSettingsRoute = pathname.startsWith("/settings");

  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${geistSans.variable} ${openDyslexic.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <FontProvider>
            <I18nProvider>
              <AppQueryClientProvider>
                <TooltipProvider>
                  <Toaster
                    position="bottom-right"
                    richColors
                    visibleToasts={5}
                  />
                  {isAuthRoute || isExploreRoute || isSettingsRoute ? (
                    children
                  ) : (
                    <>
                      <Navbar />
                      <PageWrapper>{children}</PageWrapper>
                    </>
                  )}
                </TooltipProvider>
              </AppQueryClientProvider>
            </I18nProvider>
          </FontProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
