import type { AppRole } from "@/types/session";

const AUTH_TOKEN = "auth_token";
const USER_COOKIE = "iropa_user";

export const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 วัน

export function cookieBaseOptions() {
  return {
    path: "/" as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export function buildUserCookieValue(payload: {
  name: string;
  roleLabel: string;
  role: AppRole;
  avatarUrl?: string | null;
}): string {
  return encodeURIComponent(JSON.stringify(payload));
}

export { AUTH_TOKEN, USER_COOKIE };
