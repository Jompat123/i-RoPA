import { NextResponse } from "next/server";

import { apiPathUserItem } from "@/config/api-endpoints";
import { requireApiRole } from "@/lib/auth/require-api-role";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "@/lib/data/runtime";

type UpdateUserPayload = {
  name?: string;
  email?: string;
  role?: "ADMIN" | "VIEWER" | "DEPARTMENT_USER" | "AUDITOR";
  departmentId?: string | null;
  password?: string;
};

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const denied = await requireApiRole(["ADMIN"]);
  if (denied) return denied;

  const { id } = await context.params;
  const body = (await request.json()) as UpdateUserPayload;

  if (shouldUseMockData()) {
    return NextResponse.json({ id, ...body, updatedAt: new Date().toISOString() });
  }

  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathUserItem(id)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = await res.json().catch(() => ({}));
    return NextResponse.json(payload, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
