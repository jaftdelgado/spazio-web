import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";

export default function AdminDashboardPage() {
  redirect(ROUTES.admin.properties);
}
