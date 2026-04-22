import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/get-session-user";
import type { AppRole } from "@/types/session";

export async function requireApiRole(allowedRoles: AppRole[]): Promise<NextResponse | null> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.role || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
