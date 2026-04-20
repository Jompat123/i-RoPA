import { redirect } from "next/navigation";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getSessionUser } from "@/lib/auth/get-session-user";

export default async function DashboardRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
