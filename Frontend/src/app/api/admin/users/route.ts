import { NextResponse } from "next/server";

import { apiPathUsers } from "@/config/api-endpoints";
import { requireApiRole } from "@/lib/auth/require-api-role";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "@/lib/data/runtime";

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "VIEWER" | "DEPARTMENT_USER";
  departmentId?: string | null;
};

export async function GET() {
  const denied = await requireApiRole(["ADMIN"]);
  if (denied) return denied;

  if (shouldUseMockData()) {
    return NextResponse.json([], { status: 200 });
  }

  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathUsers()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await res.json().catch(() => ({}));
    return NextResponse.json(payload, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireApiRole(["ADMIN"]);
  if (denied) return denied;

  const body = (await request.json()) as CreateUserPayload;

  if (!body.name?.trim() || !body.email?.trim() || !body.password?.trim()) {
    return NextResponse.json({ error: "name, email, password are required" }, { status: 400 });
  }
  if ((body.role === "DEPARTMENT_USER" || body.role === "VIEWER") && !body.departmentId) {
    return NextResponse.json({ error: "departmentId is required for DPO/Data Owner" }, { status: 400 });
  }

  if (shouldUseMockData()) {
    return NextResponse.json(
      { id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString() },
      { status: 201 },
    );
  }

  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathUsers()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const payload = await res.json().catch(() => ({}));
    return NextResponse.json(payload, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
