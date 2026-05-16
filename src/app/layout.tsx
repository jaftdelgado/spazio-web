"use client";

import type { ReactNode } from "react";

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
    <html lang="en">
      <body>
        <AppQueryClientProvider>
          <Navbar />
          <PageWrapper>{children}</PageWrapper>
        </AppQueryClientProvider>
      </body>
    </html>
  );
}
