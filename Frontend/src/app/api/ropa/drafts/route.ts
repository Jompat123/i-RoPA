import { NextResponse } from "next/server";

import { apiPathRopaList } from "@/config/api-endpoints";
import { requireApiRole } from "@/lib/auth/require-api-role";
import { extractErrorMessage, sanitizeRopaPayload } from "@/lib/contracts/backend-contract";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "@/lib/data/runtime";
import { createMockRopa } from "@/lib/data/mock-ropa-store";

function buildCreatePayloadFromSanitized(
  safe: Record<string, unknown>,
  ropaRole: "controller" | "processor",
): Parameters<typeof createMockRopa>[0] {
  return {
    processName: String(safe.processName ?? "").trim() || "แบบฟอร์มที่ยังไม่ระบุชื่อกิจกรรม",
    ropaRole,
    status: (safe.status as string) || "DRAFT",
    purpose: (safe.purpose as string) ?? null,
    personalDataTypes: (safe.personalDataTypes as string[]) ?? [],
    dataCategory: (safe.dataCategory as string) ?? null,
    dataType: (safe.dataType as string) ?? "GENERAL",
    collectionMethod: (safe.collectionMethod as string) ?? null,
    dataSource: (safe.dataSource as string) ?? null,
    dataControllerAddress: (safe.dataControllerAddress as string) ?? null,
    legalBasis: (safe.legalBasis as string) ?? null,
    legalExemption28: (safe.legalExemption28 as string) ?? null,
    minorConsentUnder10: safe.minorConsentUnder10 === true,
    minorConsent10to20: safe.minorConsent10to20 === true,
    minorConsentOtherNote: (safe.minorConsentOtherNote as string) ?? null,
    crossBorderTransfer: (safe.crossBorderTransfer as boolean) ?? false,
    transferCountry: (safe.transferCountry as string) ?? null,
    transferToAffiliate: (safe.transferToAffiliate as boolean) ?? false,
    transferAffiliateName: (safe.transferAffiliateName as string) ?? null,
    transferMethod: (safe.transferMethod as string) ?? null,
    protectionStandard: (safe.protectionStandard as string) ?? null,
    storageDataType: (safe.storageDataType as string) ?? null,
    rightsAccessNote: (safe.rightsAccessNote as string) ?? null,
    storageMethod: (safe.storageMethod as string) ?? null,
    deletionMethod: (safe.deletionMethod as string) ?? null,
    disclosureNote: (safe.disclosureNote as string) ?? null,
    rightsRefusalNote: (safe.rightsRefusalNote as string) ?? null,
    securityTech: (safe.securityTech as string) ?? null,
    securityPhysical: (safe.securityPhysical as string) ?? null,
    securityOrg: (safe.securityOrg as string) ?? null,
    securityAccessControl: (safe.securityAccessControl as string) ?? null,
    securityUserResponsibility: (safe.securityUserResponsibility as string) ?? null,
    retentionPeriod: (safe.retentionPeriod as string) ?? null,
    reviewNote: (safe.reviewNote as string) ?? null,
    reviewChecks: (safe.reviewChecks as unknown[]) ?? [],
  };
}

export async function POST(request: Request) {
  const denied = await requireApiRole(["DATA_OWNER"]);
  if (denied) return denied;

  const raw = (await request.json()) as Record<string, unknown>;
  const processName = typeof raw.processName === "string" ? raw.processName.trim() : "";
  if (!processName) {
    return NextResponse.json({ error: "processName is required" }, { status: 400 });
  }
  if (
    raw.status === "PENDING" &&
    (!String(raw.securityPhysical ?? "").trim() || !String(raw.securityOrg ?? "").trim())
  ) {
    return NextResponse.json(
      { error: "securityPhysical and securityOrg are required before submit" },
      { status: 400 },
    );
  }

  const ropaRole: "controller" | "processor" =
    raw.role === "processor" || raw.ropaRole === "processor" ? "processor" : "controller";
  const merged: Record<string, unknown> = { ...raw, processName, role: ropaRole };
  const safe = sanitizeRopaPayload(merged);

  if (shouldUseMockData()) {
    const created = createMockRopa(buildCreatePayloadFromSanitized(safe, ropaRole));
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
    const res = await fetch(`${base.replace(/\/$/, "")}${apiPathRopaList()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(safe),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: extractErrorMessage(payload, "Failed to save draft") },
        { status: res.status },
      );
    }

    return NextResponse.json(payload, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}
