import { NextResponse } from "next/server";

import { apiPathDepartments } from "@/config/api-endpoints";
import { requireApiRole } from "@/lib/auth/require-api-role";
import { extractErrorMessage } from "@/lib/contracts/backend-contract";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "@/lib/data/runtime";

type CreateDepartmentPayload = {
  name?: string;
  description?: string;
};

export async function POST(request: Request) {
  const denied = await requireApiRole(["ADMIN"]);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as CreateDepartmentPayload;
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (shouldUseMockData()) {
    return NextResponse.json(
      {
        id: crypto.randomUUID(),
        name,
        description: description || null,
      },
      { status: 201 },
    );
  }

  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathDepartments()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: description || null,
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: extractErrorMessage(payload, "Failed to create department") },
        { status: res.status },
      );
    }
    return NextResponse.json(payload, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
  }
}
