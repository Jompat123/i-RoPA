import { redirect } from "next/navigation";

import { AdminDashboardHome } from "@/components/admin/AdminDashboardHome";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getAdminDashboardData } from "@/lib/data/get-admin-dashboard-data";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const data = await getAdminDashboardData();
  return <AdminDashboardHome data={data} />;
}
