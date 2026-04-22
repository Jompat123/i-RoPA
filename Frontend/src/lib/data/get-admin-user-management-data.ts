import { apiPathDepartments, apiPathUsers } from "@/config/api-endpoints";
import { adminUserManagementMock } from "@/data/admin-mock";
import type { AdminUserManagementData, AdminUserRole, AdminUserRow } from "@/types/admin";
import { getLiveApiSession } from "@/lib/data/api-session";
import { shouldUseMockData } from "./runtime";

type Query = Record<string, string | string[] | undefined>;

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string | null;
  department?: { id?: string; name?: string | null } | null;
};
type ApiDepartment = { id: string; name: string };

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
    departmentId: u.departmentId ?? u.department?.id ?? null,
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
  const session = await getLiveApiSession();
  if (!session.ok) return null;
  try {
    const res = await fetch(`${session.base.replace(/\/$/, "")}${apiPathUsers()}`, {
      headers: { Authorization: `Bearer ${session.token}` },
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

async function fetchApiDepartments(): Promise<ApiDepartment[] | null> {
  const session = await getLiveApiSession();
  if (!session.ok) return null;
  try {
    const res = await fetch(`${session.base.replace(/\/$/, "")}${apiPathDepartments()}`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Array<{ id?: string; name?: string }>;
    if (!Array.isArray(json)) return null;
    return json
      .map((dep) => ({
        id: String(dep.id || "").trim(),
        name: String(dep.name || "").trim(),
      }))
      .filter((dep) => dep.id && dep.name);
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

  let baseRows: AdminUserRow[];
  let source: "api" | "mock";
  let loadError: string | null = null;

  if (shouldUseMockData()) {
    baseRows = adminUserManagementMock.rows;
    source = "mock";
  } else {
    const session = await getLiveApiSession();
    if (!session.ok) {
      baseRows = [];
      source = "api";
      loadError = session.error;
    } else {
      const apiRows = await fetchApiRows();
      if (apiRows) {
        baseRows = apiRows;
        source = "api";
      } else {
        baseRows = [];
        source = "api";
        loadError = "โหลดรายชื่อผู้ใช้จากเซิร์ฟเวอร์ไม่สำเร็จ";
      }
    }
  }

  const rows = filterRows(baseRows, q, role, department);
  const departments = [...new Set(baseRows.map((r) => r.department))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );
  const departmentOptions =
    source === "mock"
      ? adminUserManagementMock.departmentOptions
      : (await fetchApiDepartments())?.map((dep) => ({ id: dep.id, name: dep.name })) ?? [];

  return {
    source,
    loadError,
    rows,
    filters: { q, role, department },
    departments,
    departmentOptions,
  };
}
