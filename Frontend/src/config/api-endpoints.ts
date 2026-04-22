/**
 * Path ต่อท้าย API base (`NEXT_PUBLIC_API_URL` / `API_URL`)
 * ปรับ env ได้ถ้า backend ใช้ route คนละแบบ
 */
function envPath(envKey: string, fallback: string): string {
  const raw = process.env[envKey];
  if (raw == null || String(raw).trim() === "") return fallback;
  const v = String(raw).trim();
  return v.startsWith("/") ? v : `/${v}`;
}

export function apiPathRopaList(): string {
  return envPath("NEXT_PUBLIC_API_ROPA_PATH", "/api/ropa");
}

export function apiPathRopaItem(id: string): string {
  return `${apiPathRopaList()}/${encodeURIComponent(id)}`;
}

export function apiPathUsers(): string {
  return envPath("NEXT_PUBLIC_API_USERS_PATH", "/api/users");
}

export function apiPathUserItem(id: string): string {
  return `${apiPathUsers()}/${encodeURIComponent(id)}`;
}

export function apiPathDepartments(): string {
  return envPath("NEXT_PUBLIC_API_DEPARTMENTS_PATH", "/api/departments");
}

/** Data Owner — การ์ดสรุปหน้าแรก */
export function apiPathDataOwnerDashboardSummary(): string {
  return envPath("NEXT_PUBLIC_API_DATA_OWNER_DASHBOARD_SUMMARY_PATH", "/api/dashboard/summary");
}

/** Admin — สรุปแดชบอร์ด */
export function apiPathAdminDashboardSummary(): string {
  return envPath("NEXT_PUBLIC_API_ADMIN_DASHBOARD_SUMMARY_PATH", "/api/dashboard/summary");
}

/** Admin — Audit logs ล่าสุด */
export function apiPathAdminAuditLogs(): string {
  return envPath("NEXT_PUBLIC_API_ADMIN_AUDIT_LOGS_PATH", "/api/audit-logs");
}

/** Login proxy — ตรงกับ `AUTH_LOGIN_PATH` ใน route handler */
export function apiPathAuthLogin(): string {
  const raw = process.env.AUTH_LOGIN_PATH ?? "/api/auth/login";
  const v = String(raw).trim();
  return v.startsWith("/") ? v : `/${v}`;
}
