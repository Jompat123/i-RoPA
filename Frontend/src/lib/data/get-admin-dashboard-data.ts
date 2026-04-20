import { adminDashboardMock } from "@/data/admin-mock";
import type { AdminDashboardData } from "@/types/admin";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "./runtime";

type ApiSummary = {
  totalRopa: number;
  byDepartment?: Array<{ departmentId?: string; departmentName?: string; count?: number; _count?: number }>;
};
type ApiUser = { id: string; name: string; role: string; department?: { name?: string | null } | null };

async function fetchDashboardFromApi(): Promise<AdminDashboardData | null> {
  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return null;

  try {
    const [summaryRes, usersRes] = await Promise.all([
      fetch(`${base}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${base}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);
    if (!summaryRes.ok || !usersRes.ok) return null;
    const summary = (await summaryRes.json()) as ApiSummary;
    const users = (await usersRes.json()) as ApiUser[];
    if (!Array.isArray(users)) return null;
    const departmentCounter = users.reduce<Record<string, number>>((acc, user) => {
      const dep = user.department?.name || "Unknown";
      acc[dep] = (acc[dep] || 0) + 1;
      return acc;
    }, {});

    const summaryByDept =
      summary.byDepartment?.length
        ? summary.byDepartment
            .map((d) => ({
              department: d.departmentName || d.departmentId || "Unknown",
              count: d.count ?? d._count ?? 0,
            }))
            .filter((d) => d.count > 0)
        : Object.entries(departmentCounter).map(([department, count]) => ({ department, count }));

    return {
      source: "api",
      totalUsers: users.length,
      totalDepartments: new Set(users.map((u) => u.department?.name ?? "Unknown")).size,
      totalRopa: summary.totalRopa ?? 0,
      systemOnline: true,
      departmentWorkload: summaryByDept.slice(0, 6),
      latestUsers: users.slice(0, 5).map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role === "ADMIN" ? "ADMIN" : u.role === "VIEWER" ? "DPO" : "DATA_OWNER",
        department: u.department?.name || "Unknown",
        status: "active",
      })),
      recentLogs: [
        "กิจกรรมล่าสุดจาก backend - 1 min ago",
        "ข้อมูลนี้จะถูกแทนด้วย API logs จริงในอนาคต",
      ],
    };
  } catch {
    return null;
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (shouldUseMockData()) return adminDashboardMock;
  return (await fetchDashboardFromApi()) ?? adminDashboardMock;
}
