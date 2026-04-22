import { NextResponse } from "next/server";

import { apiPathRopaItem } from "@/config/api-endpoints";
import { requireApiRole } from "@/lib/auth/require-api-role";
import { extractErrorMessage, sanitizeRopaPayload } from "@/lib/contracts/backend-contract";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "@/lib/data/runtime";
import { updateMockRopa } from "@/lib/data/mock-ropa-store";

type Ctx = { params: Promise<{ id: string }> };
type ReviewCheck = { key: string; result: "pass" | "fail" | "todo"; note?: string };
type Payload = {
  action: "approve" | "reject";
  globalNote?: string;
  checks?: ReviewCheck[];
};

export async function PATCH(request: Request, context: Ctx) {
  const denied = await requireApiRole(["DPO"]);
  if (denied) return denied;

  const { id } = await context.params;
  const body = (await request.json()) as Payload;

  if (!body.action || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  if (shouldUseMockData()) {
    const updated = updateMockRopa(id, {
      status: body.action === "approve" ? "COMPLETE" : "NEEDS_FIX",
      reviewNote: body.globalNote ?? "",
      reviewChecks: body.checks ?? [],
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: updated.id,
      action: body.action,
      checks: body.checks ?? [],
      globalNote: body.globalNote ?? "",
      updatedAt: updated.updatedAt,
    });
  }

  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Backend currently exposes status mutation via /api/ropa/:id.
  const backendPayload = sanitizeRopaPayload({
    status: body.action === "approve" ? "COMPLETE" : "NEEDS_FIX",
    reviewDecision: body.action,
    reviewNote: body.globalNote ?? "",
    reviewChecks: body.checks ?? [],
  });

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathRopaItem(id)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    });
    const responsePayload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: extractErrorMessage(responsePayload, "Failed to update DPO review") },
        { status: res.status },
      );
    }
    return NextResponse.json(responsePayload, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to update DPO review" }, { status: 500 });
  }
}
