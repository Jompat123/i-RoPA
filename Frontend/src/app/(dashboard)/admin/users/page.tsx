import { redirect } from "next/navigation";

import { AdminUserManagementPage } from "@/components/admin/AdminUserManagementPage";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { getAdminUserManagementData } from "@/lib/data/get-admin-user-management-data";

type AdminUsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") {
    redirect("/");
  }

  const params = (await searchParams) ?? {};
  const data = await getAdminUserManagementData(params);
  return <AdminUserManagementPage data={data} />;
}
