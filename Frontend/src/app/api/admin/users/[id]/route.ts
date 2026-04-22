import { NextResponse } from "next/server";

import { apiPathUserItem } from "@/config/api-endpoints";
import { requireApiRole } from "@/lib/auth/require-api-role";
import { extractErrorMessage, toBackendRole } from "@/lib/contracts/backend-contract";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "@/lib/data/runtime";

type UpdateUserPayload = {
  name?: string;
  email?: string;
  role?: "ADMIN" | "DPO" | "DATA_OWNER" | "AUDITOR";
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
    const backendBody = {
      ...body,
      role: body.role ? toBackendRole(body.role) : undefined,
    };
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathUserItem(id)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendBody),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: extractErrorMessage(payload, "Failed to update user") },
        { status: res.status },
      );
    }
    return NextResponse.json(payload, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  const denied = await requireApiRole(["ADMIN"]);
  if (denied) return denied;

  const { id } = await context.params;

  if (shouldUseMockData()) {
    return NextResponse.json({ deleted: true, id }, { status: 200 });
  }

  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathUserItem(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: extractErrorMessage(payload, "Failed to delete user") },
        { status: res.status },
      );
    }
    return NextResponse.json(payload, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
