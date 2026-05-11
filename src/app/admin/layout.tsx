"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    // TODO: implementar verificacion de sesion
    void ROUTES;
    void router;
  }, [router]);

  return (
    <div>
      <AdminSidebar />
      {children}
    </div>
  );
}
