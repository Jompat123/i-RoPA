import { apiPathAdminDashboardSummary, apiPathUsers } from "@/config/api-endpoints";
import { adminDashboardMock } from "@/data/admin-mock";
import type { AdminDashboardData } from "@/types/admin";
import { getLiveApiSession } from "@/lib/data/api-session";
import { shouldUseMockData } from "./runtime";

type ApiSummary = {
  totalRopa: number;
  byDepartment?: Array<{ departmentId?: string; departmentName?: string; count?: number; _count?: number }>;
};
type ApiUser = { id: string; name: string; role: string; department?: { name?: string | null } | null };

function emptyAdminDashboard(loadError: string): AdminDashboardData {
  return {
    source: "api",
    loadError,
    totalUsers: 0,
    totalDepartments: 0,
    totalRopa: 0,
    systemOnline: false,
    departmentWorkload: [],
    latestUsers: [],
    recentLogs: [],
  };
}

async function fetchDashboardFromApi(): Promise<AdminDashboardData | null> {
  const session = await getLiveApiSession();
  if (!session.ok) return null;

  try {
    const base = session.base.replace(/\/$/, "");
    const [summaryRes, usersRes] = await Promise.all([
      fetch(`${base}${apiPathAdminDashboardSummary()}`, {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      }),
      fetch(`${base}${apiPathUsers()}`, {
        headers: { Authorization: `Bearer ${session.token}` },
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
      loadError: null,
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
      recentLogs: [],
    };
  } catch {
    return null;
  }
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  if (shouldUseMockData()) return adminDashboardMock;
  const api = await fetchDashboardFromApi();
  if (api) return api;
  const session = await getLiveApiSession();
  if (!session.ok) {
    return emptyAdminDashboard(session.error);
  }
  return emptyAdminDashboard("โหลดข้อมูลแดชบอร์ดผู้ดูแลระบบไม่สำเร็จ");
}
