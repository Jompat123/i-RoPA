import { NextResponse } from "next/server";

import { AUTH_TOKEN, USER_COOKIE, cookieBaseOptions } from "@/lib/auth/session-cookies";

function clearSession(res: NextResponse) {
  const base = { ...cookieBaseOptions(), maxAge: 0 };
  res.cookies.set(AUTH_TOKEN, "", { ...base, httpOnly: true });
  res.cookies.set(USER_COOKIE, "", { ...base, httpOnly: true });
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearSession(res);
  return res;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const res = NextResponse.redirect(new URL("/login", url.origin));
  clearSession(res);
  return res;
}
