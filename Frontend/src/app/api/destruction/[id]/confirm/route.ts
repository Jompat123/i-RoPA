import { NextResponse } from "next/server";

import { apiPathRopaItem } from "@/config/api-endpoints";
import { requireApiRole } from "@/lib/auth/require-api-role";
import { extractErrorMessage } from "@/lib/contracts/backend-contract";
import { getMockRopaById, updateMockRopa } from "@/lib/data/mock-ropa-store";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "@/lib/data/runtime";

type Ctx = { params: Promise<{ id: string }> };
type ConfirmPayload = {
  proofUrl?: string;
  note?: string;
};

export async function PATCH(request: Request, context: Ctx) {
  const denied = await requireApiRole(["DATA_OWNER", "ADMIN"]);
  if (denied) return denied;

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as ConfirmPayload;
  const proofUrl = String(body.proofUrl ?? "").trim();
  const note = String(body.note ?? "").trim();

  if (!proofUrl) {
    return NextResponse.json({ error: "proofUrl is required" }, { status: 400 });
  }

  if (shouldUseMockData()) {
    const existing = getMockRopaById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const updated = updateMockRopa(id, {
      destructionProofUrl: proofUrl,
      destructionNote: note || null,
      destructionConfirmedAt: new Date().toISOString(),
    });
    return NextResponse.json(
      {
        ok: true,
        id: updated?.id || id,
        destructionProofUrl: updated?.destructionProofUrl || proofUrl,
        destructionNote: updated?.destructionNote || note || null,
        destructionConfirmedAt: updated?.destructionConfirmedAt || new Date().toISOString(),
      },
      { status: 200 },
    );
  }

  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathRopaItem(id)}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destructionProofUrl: proofUrl,
        destructionNote: note || null,
        destructionConfirmedAt: new Date().toISOString(),
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: extractErrorMessage(payload, "Failed to confirm destruction") },
        { status: res.status },
      );
    }
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to confirm destruction" }, { status: 500 });
  }
}
