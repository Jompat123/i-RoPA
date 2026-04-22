import { cookies } from "next/headers";

import type { AppRole, SessionUser } from "@/types/session";

const USER_COOKIE = "iropa_user";

/**
 * อ่านผู้ใช้จาก cookie หลังล็อกอิน
 * รูปแบบที่คาดหวัง: JSON string { name, roleLabel, avatarUrl? }
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) return null;

  try {
    const safeDecoded = (() => {
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    })();
    const parsed = JSON.parse(safeDecoded) as SessionUser & { role?: string };
    if (typeof parsed.name !== "string" || typeof parsed.roleLabel !== "string") {
      return null;
    }
    const rawRole = (parsed.role ?? "").toUpperCase();
    const upperRoleLabel = parsed.roleLabel.toUpperCase();
    const normalizedRole: AppRole =
      rawRole === "ADMIN"
        ? "ADMIN"
        : rawRole === "DPO" || rawRole === "VIEWER"
          ? "DPO"
          : rawRole === "DATA_OWNER" || rawRole === "DEPARTMENT_USER"
            ? "DATA_OWNER"
            : upperRoleLabel.includes("ADMIN")
              ? "ADMIN"
              : upperRoleLabel.includes("DPO")
                ? "DPO"
                : "DATA_OWNER";
    return {
      id: typeof parsed.id === "string" ? parsed.id : undefined,
      name: parsed.name,
      roleLabel: parsed.roleLabel,
      role: normalizedRole,
      avatarUrl: parsed.avatarUrl ?? null,
    };
  } catch {
    return null;
  }
}
