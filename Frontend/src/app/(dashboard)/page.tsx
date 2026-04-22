import { redirect } from "next/navigation";

import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getDashboardPageData } from "@/lib/data/get-dashboard-page-data";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user?.role === "ADMIN") {
    redirect("/admin");
  }
  if (user?.role === "DPO") {
    redirect("/dpo");
  }
  if (user?.role === "AUDITOR") {
    redirect("/dpo/records");
  }
  const data = await getDashboardPageData();
  return <DashboardHome data={data} />;
}
