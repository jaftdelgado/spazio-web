import type { ReactNode } from "react";

import {
  AdminSidebarNav,
  Building03Icon,
  Calendar03Icon,
  CreditCardIcon,
  Home01Icon,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/layout/AdminSidebar";
import { ROUTES } from "@/config/routes";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

const adminNavItems = [
  { href: ROUTES.admin.root, label: "Resumen", icon: Home01Icon },
  {
    href: ROUTES.admin.properties,
    label: "Propiedades",
    icon: Building03Icon,
  },
  { href: ROUTES.admin.visits, label: "Visitas", icon: Calendar03Icon },
  { href: ROUTES.admin.payments, label: "Pagos", icon: CreditCardIcon },
] as const;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider className="admin-shell min-h-screen text-slate-950">
      <Sidebar
        collapsible="icon"
        className="admin-sidebar border-r border-slate-200"
      >
        <SidebarContent className="px-4 pb-4 group-data-[collapsible=icon]:px-2">
          <SidebarGroup>
            <SidebarGroupLabel>Navegacion</SidebarGroupLabel>
            <SidebarGroupContent>
              <AdminSidebarNav items={adminNavItems} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-screen">
        <div className="flex min-h-screen flex-col">
          <header className="admin-topbar border-b border-slate-200/80 px-6 py-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <SidebarTrigger className="mt-1" />
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col p-6">
            <div className="mx-auto flex min-h-full w-full max-w-7xl flex-1 flex-col">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
