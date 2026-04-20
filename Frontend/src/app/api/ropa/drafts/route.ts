import { NextResponse } from "next/server";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "@/lib/data/runtime";
import { createMockRopa } from "@/lib/data/mock-ropa-store";

type DraftPayload = {
  processName: string;
  purpose?: string | null;
  personalDataTypes?: string[];
  dataCategory?: string | null;
  dataType?: "GENERAL" | "SENSITIVE";
  collectionMethod?: string | null;
  dataSource?: string | null;
  legalBasis?: string | null;
  crossBorderTransfer?: boolean;
  transferCountry?: string | null;
  retentionPeriod?: string | null;
  storageMethod?: string | null;
  deletionMethod?: string | null;
  securityTech?: string | null;
  securityPhysical?: string | null;
  securityOrg?: string | null;
  status?: "DRAFT" | "PENDING" | "NEEDS_FIX" | "COMPLETE" | "APPROVED";
};

export async function POST(request: Request) {
  const body = (await request.json()) as DraftPayload;

  if (!body.processName || !body.processName.trim()) {
    return NextResponse.json({ error: "processName is required" }, { status: 400 });
  }

  if (shouldUseMockData()) {
    const created = createMockRopa({
      processName: body.processName.trim(),
      purpose: body.purpose ?? null,
      personalDataTypes: body.personalDataTypes ?? [],
      dataCategory: body.dataCategory ?? null,
      dataType: body.dataType ?? "GENERAL",
      collectionMethod: body.collectionMethod ?? null,
      dataSource: body.dataSource ?? null,
      legalBasis: body.legalBasis ?? null,
      crossBorderTransfer: body.crossBorderTransfer ?? false,
      transferCountry: body.transferCountry ?? null,
      retentionPeriod: body.retentionPeriod ?? null,
      storageMethod: body.storageMethod ?? null,
      deletionMethod: body.deletionMethod ?? null,
      securityTech: body.securityTech ?? null,
      securityPhysical: body.securityPhysical ?? null,
      securityOrg: body.securityOrg ?? null,
      status: body.status ?? "DRAFT",
    });
    return NextResponse.json(
      {
        id: created.id,
        referenceCode: created.referenceCode,
        processName: created.processName,
        status: created.status,
        createdAt: created.createdAt,
      },
      { status: 201 },
    );
  }

  const base = getApiBaseUrl();
  if (!base) {
    return NextResponse.json({ error: "API_URL is not configured" }, { status: 500 });
  }
  const token = await getAuthTokenFromCookie();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${base}/api/ropa`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        processName: body.processName.trim(),
        purpose: body.purpose ?? null,
        personalDataTypes: body.personalDataTypes ?? [],
        dataCategory: body.dataCategory ?? null,
        dataType: body.dataType ?? "GENERAL",
        collectionMethod: body.collectionMethod ?? null,
        dataSource: body.dataSource ?? null,
        legalBasis: body.legalBasis ?? null,
        crossBorderTransfer: body.crossBorderTransfer ?? false,
        transferCountry: body.transferCountry ?? null,
        retentionPeriod: body.retentionPeriod ?? null,
        storageMethod: body.storageMethod ?? null,
        deletionMethod: body.deletionMethod ?? null,
        securityTech: body.securityTech ?? null,
        securityPhysical: body.securityPhysical ?? null,
        securityOrg: body.securityOrg ?? null,
        status: body.status ?? "DRAFT",
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: (payload as { error?: string }).error ?? "Failed to save draft" },
        { status: res.status },
      );
    }

    return NextResponse.json(payload, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}
