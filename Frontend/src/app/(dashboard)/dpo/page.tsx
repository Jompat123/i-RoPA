import { redirect } from "next/navigation";

import { DpoDashboardHome } from "@/components/dpo/DpoDashboardHome";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getDpoDashboardData } from "@/lib/data/get-dpo-dashboard-data";

export default async function DpoDashboardPage() {
  const user = await getSessionUser();
  if (user?.role !== "DPO") {
    redirect("/");
  }

  const data = await getDpoDashboardData();
  return <DpoDashboardHome data={data} />;
}
