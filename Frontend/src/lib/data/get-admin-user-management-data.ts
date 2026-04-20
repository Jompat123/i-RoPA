import { adminUserManagementMock } from "@/data/admin-mock";
import type { AdminUserManagementData, AdminUserRole, AdminUserRow } from "@/types/admin";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "./runtime";

type Query = Record<string, string | string[] | undefined>;

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: { name?: string | null } | null;
};

function getParam(q: Query, key: string): string {
  const v = q[key];
  const val = Array.isArray(v) ? v[0] : v;
  return (val ?? "").trim();
}

function toRole(role: string): AdminUserRole {
  if (role === "ADMIN") return "ADMIN";
  if (role === "VIEWER" || role === "DPO") return "DPO";
  return "DATA_OWNER";
}

function fromApi(rows: ApiUser[]): AdminUserRow[] {
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: toRole(u.role),
    department: u.department?.name || "Unknown",
    status: "active",
  }));
}

function filterRows(rows: AdminUserRow[], q: string, role: string, department: string) {
  const search = q.toLowerCase();
  return rows.filter((r) => {
    const byQ =
      !search ||
      r.name.toLowerCase().includes(search) ||
      r.email.toLowerCase().includes(search) ||
      r.department.toLowerCase().includes(search);
    const byRole = role === "all" || r.role === role;
    const byDepartment = !department || r.department === department;
    return byQ && byRole && byDepartment;
  });
}

async function fetchApiRows(): Promise<AdminUserRow[] | null> {
  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return null;
  try {
    const res = await fetch(`${base}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiUser[];
    if (!Array.isArray(json)) return null;
    return fromApi(json);
  } catch {
    return null;
  }
}

export async function getAdminUserManagementData(
  searchParams: Query,
): Promise<AdminUserManagementData> {
  const q = getParam(searchParams, "q");
  const role = (getParam(searchParams, "role") || "all") as "all" | AdminUserRole;
  const department = getParam(searchParams, "department");

  const apiRows = shouldUseMockData() ? null : await fetchApiRows();
  const source: "api" | "mock" = apiRows ? "api" : "mock";
  const baseRows = apiRows ?? adminUserManagementMock.rows;
  const rows = filterRows(baseRows, q, role, department);
  const departments = [...new Set(baseRows.map((r) => r.department))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );

  return {
    source,
    rows,
    filters: { q, role, department },
    departments,
  };
}
