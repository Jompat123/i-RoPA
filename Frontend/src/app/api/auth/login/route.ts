import { NextResponse } from "next/server";

import {
  AUTH_TOKEN,
  USER_COOKIE,
  buildUserCookieValue,
  cookieBaseOptions,
} from "@/lib/auth/session-cookies";
import type { AppRole } from "@/types/session";
import { getApiBaseUrl, shouldUseMockData } from "@/lib/data/runtime";

type LoginBody = {
  email?: string;
  password?: string;
};

type MockAccount = {
  password: string;
  name: string;
  roleLabel: string;
  role: AppRole;
};

/** บัญชีทดสอบเมื่อไม่มี backend หรือเปิด mock */
const MOCK_ACCOUNTS: Record<string, MockAccount> = {
  "admin@i-ropa.local": {
    password: "password123",
    name: "ผู้ดูแลระบบ",
    roleLabel: "Admin",
    role: "ADMIN",
  },
  "dpo@i-ropa.local": {
    password: "password123",
    name: "เจ้าหน้าที่ DPO",
    roleLabel: "DPO",
    role: "DPO",
  },
  "owner@i-ropa.local": {
    password: "password123",
    name: "เจ้าของข้อมูล",
    roleLabel: "Data Owner",
    role: "DATA_OWNER",
  },
};

function safeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function applySessionCookies(
  res: NextResponse,
  token: string,
  user: { name: string; roleLabel: string; role: AppRole; avatarUrl?: string | null },
) {
  const base = cookieBaseOptions();
  res.cookies.set(AUTH_TOKEN, token, { ...base, httpOnly: true });
  res.cookies.set(USER_COOKIE, buildUserCookieValue(user), { ...base, httpOnly: true });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = safeEmail(body.email ?? "");
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 400 });
  }

  const base = getApiBaseUrl();
  const useMock = shouldUseMockData() || !base;

  if (!useMock) {
    try {
      const path = (process.env.AUTH_LOGIN_PATH ?? "/api/auth/login").replace(/^\//, "");
      const res = await fetch(`${base}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });
      const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>;

      if (!res.ok) {
        const msg =
          typeof payload.error === "string"
            ? payload.error
            : typeof payload.message === "string"
              ? payload.message
              : "เข้าสู่ระบบไม่สำเร็จ";
        return NextResponse.json({ error: msg }, { status: res.status });
      }

      const token =
        (typeof payload.token === "string" && payload.token) ||
        (typeof payload.accessToken === "string" && payload.accessToken) ||
        (typeof (payload.data as { token?: string } | undefined)?.token === "string" &&
          (payload.data as { token: string }).token) ||
        crypto.randomUUID();

      const rawUser = (payload.user ?? payload.data ?? payload) as Record<string, unknown>;
      const name =
        typeof rawUser.name === "string"
          ? rawUser.name
          : typeof rawUser.fullName === "string"
            ? rawUser.fullName
            : email.split("@")[0] ?? "User";
      const roleRaw = String(rawUser.role ?? rawUser.roleName ?? "").toUpperCase();
      const roleLabel =
        typeof rawUser.roleLabel === "string"
          ? rawUser.roleLabel
          : roleRaw === "ADMIN"
            ? "Admin"
            : roleRaw === "DPO" || roleRaw === "VIEWER"
              ? "DPO"
              : "Data Owner";
      const role: AppRole =
        roleRaw === "ADMIN"
          ? "ADMIN"
          : roleRaw === "DPO" || roleRaw === "VIEWER"
            ? "DPO"
            : "DATA_OWNER";

      const out = NextResponse.json({ ok: true });
      applySessionCookies(out, token, {
        name,
        roleLabel,
        role,
        avatarUrl: typeof rawUser.avatarUrl === "string" ? rawUser.avatarUrl : null,
      });
      return out;
    } catch {
      return NextResponse.json({ error: "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ" }, { status: 502 });
    }
  }

  const account = MOCK_ACCOUNTS[email];
  if (!account || account.password !== password) {
    return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  }

  const out = NextResponse.json({ ok: true });
  applySessionCookies(out, crypto.randomUUID(), {
    name: account.name,
    roleLabel: account.roleLabel,
    role: account.role,
  });
  return out;
}
