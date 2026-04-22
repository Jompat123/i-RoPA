import { apiPathRopaList } from "@/config/api-endpoints";
import type { MockRopaEntry } from "@/lib/data/mock-ropa-store";
import { listMockRopa } from "@/lib/data/mock-ropa-store";
import type { DpoRecordRow, DpoRecordsData, RopaEntityRole } from "@/types/dpo";
import { getLiveApiSession } from "@/lib/data/api-session";
import { shouldUseMockData } from "./runtime";

type Query = Record<string, string | string[] | undefined>;

type ApiRopa = {
  id: string;
  processName?: string | null;
  status?: string | null;
  department?: { name?: string | null } | null;
  legalBasis?: string | null;
  retentionPeriod?: string | null;
  dataType?: string | null;
  purpose?: string | null;
  ropaRole?: string | null;
  dataControllerRole?: string | null;
  dataSource?: string | null;
  dataControllerAddress?: string | null;
  personalDataTypes?: string[] | string | null;
  dataCategory?: string | null;
  collectionMethod?: string | null;
  crossBorderTransfer?: boolean | null;
  transferCountry?: string | null;
  transferToAffiliate?: boolean | null;
  transferMethod?: string | null;
  protectionStandard?: string | null;
  legalExemption28?: string | null;
  storageMethod?: string | null;
  deletionMethod?: string | null;
  disclosureNote?: string | null;
  rightsRefusalNote?: string | null;
  securityTech?: string | null;
  securityPhysical?: string | null;
  securityOrg?: string | null;
};

function getParam(q: Query, key: string): string {
  const raw = q[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim();
}

function parseApiRole(raw: unknown): RopaEntityRole {
  const s = String(raw ?? "").toUpperCase();
  if (s === "PROCESSOR" || s === "DATA_PROCESSOR") return "processor";
  return "controller";
}

function buildSecuritySummary(
  role: RopaEntityRole,
  tech?: string | null,
  physical?: string | null,
  org?: string | null,
): string | null {
  if (role === "processor") return null;
  const parts = [tech, physical, org]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
  return parts.length ? parts.join(" | ") : null;
}

function parseCollectionMethod(raw: unknown): {
  source: "direct" | "other" | null;
  method: "soft" | "hard" | null;
} {
  const value = String(raw ?? "").trim().toUpperCase();
  if (!value) return { source: null, method: null };

  const parts = value.split("|").map((x) => x.trim()).filter(Boolean);
  const source = parts.find((x) => x === "DIRECT" || x === "OTHER") ?? value;
  const method = parts.find((x) => x === "SOFT" || x === "HARD") ?? value;
  return {
    source: source === "DIRECT" ? "direct" : source === "OTHER" ? "other" : null,
    method: method === "SOFT" ? "soft" : method === "HARD" ? "hard" : null,
  };
}

function parsePersonalDataTypes(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean);
  return String(raw ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function fromMockEntry(row: MockRopaEntry): DpoRecordRow {
  const role: RopaEntityRole = row.ropaRole === "processor" ? "processor" : "controller";
  const collection = parseCollectionMethod(row.collectionMethod);
  return {
    id: row.id,
    role,
    processName: row.processName || "-",
    department: row.department?.name || "Unknown",
    purpose: row.purpose || "-",
    dataSourceName: role === "controller" ? row.dataSource ?? null : null,
    processorName: role === "processor" ? row.dataSource ?? null : null,
    controllerAddress: row.dataControllerAddress ?? null,
    personalDataTypes: parsePersonalDataTypes(row.personalDataTypes),
    dataCategory: row.dataCategory ?? null,
    dataType: row.dataType || "-",
    collectionMethodType: collection.method,
    collectionSource: collection.source,
    legalBasis: row.legalBasis || "-",
    minorConsentUnder10: null,
    minorConsent10to20: null,
    crossBorderTransfer: row.crossBorderTransfer ?? null,
    transferCountry: row.transferCountry ?? null,
    transferToAffiliate: null,
    transferMethod: row.transferMethod ?? null,
    protectionStandard: row.protectionStandard ?? null,
    legalExemption28: null,
    storageDataType: null,
    storageMethod: row.storageMethod ?? null,
    retentionPeriod: row.retentionPeriod || "-",
    rightsAccessNote: null,
    deletionMethod: row.deletionMethod ?? null,
    disclosureNote: null,
    rightsRefusalNote: role === "processor" ? null : row.rightsRefusalNote ?? null,
    securityMeasuresSummary: buildSecuritySummary(role, row.securityTech, row.securityPhysical, row.securityOrg),
    securityOrg: row.securityOrg ?? null,
    securityTech: row.securityTech ?? null,
    securityPhysical: row.securityPhysical ?? null,
    securityAccessControl: null,
    securityUserResponsibility: null,
    securityAudit: null,
  };
}

function fromApiEntry(row: ApiRopa): DpoRecordRow {
  const role = parseApiRole(row.ropaRole ?? row.dataControllerRole);
  const collection = parseCollectionMethod(row.collectionMethod);
  return {
    id: row.id,
    role,
    processName: row.processName || "-",
    department: row.department?.name || "Unknown",
    purpose: row.purpose || "-",
    dataSourceName: role === "controller" ? row.dataSource ?? null : null,
    processorName: role === "processor" ? row.dataSource ?? null : null,
    controllerAddress: row.dataControllerAddress ?? null,
    personalDataTypes: parsePersonalDataTypes(row.personalDataTypes),
    dataCategory: row.dataCategory ?? null,
    dataType: row.dataType || "-",
    collectionMethodType: collection.method,
    collectionSource: collection.source,
    legalBasis: row.legalBasis || "-",
    minorConsentUnder10: null,
    minorConsent10to20: null,
    crossBorderTransfer: row.crossBorderTransfer ?? null,
    transferCountry: row.transferCountry ?? null,
    transferToAffiliate: row.transferToAffiliate ?? null,
    transferMethod: row.transferMethod ?? null,
    protectionStandard: row.protectionStandard ?? null,
    legalExemption28: row.legalExemption28 ?? null,
    storageDataType: null,
    storageMethod: row.storageMethod ?? null,
    retentionPeriod: row.retentionPeriod || "-",
    rightsAccessNote: null,
    deletionMethod: row.deletionMethod ?? null,
    disclosureNote: row.disclosureNote ?? null,
    rightsRefusalNote: role === "processor" ? null : row.rightsRefusalNote ?? null,
    securityMeasuresSummary: buildSecuritySummary(
      role,
      row.securityTech,
      row.securityPhysical,
      row.securityOrg,
    ),
    securityOrg: row.securityOrg ?? null,
    securityTech: row.securityTech ?? null,
    securityPhysical: row.securityPhysical ?? null,
    securityAccessControl: null,
    securityUserResponsibility: null,
    securityAudit: null,
  };
}

function normalizeRows(rows: ApiRopa[]): DpoRecordRow[] {
  return rows
    .filter((row) => {
      const status = String(row.status || "").toUpperCase();
      return status === "COMPLETE" || status === "APPROVED";
    })
    .map(fromApiEntry);
}

function normalizeMockRows(rows: MockRopaEntry[]): DpoRecordRow[] {
  return rows
    .filter((row) => {
      const status = String(row.status || "").toUpperCase();
      return status === "COMPLETE" || status === "APPROVED";
    })
    .map(fromMockEntry);
}

function filterRows(
  rows: DpoRecordRow[],
  department: string,
  dataType: string,
  legalBasis: string,
): DpoRecordRow[] {
  return rows.filter((row) => {
    const byDepartment = !department || row.department === department;
    const byDataType = !dataType || row.dataType === dataType;
    const byLegalBasis = !legalBasis || row.legalBasis === legalBasis;
    return byDepartment && byDataType && byLegalBasis;
  });
}

async function fetchApiRows(): Promise<DpoRecordRow[] | null> {
  const session = await getLiveApiSession();
  if (!session.ok) return null;

  try {
    const res = await fetch(`${session.base.replace(/\/$/, "")}${apiPathRopaList()}`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as ApiRopa[];
    if (!Array.isArray(payload)) return null;
    return normalizeRows(payload);
  } catch {
    return null;
  }
}

export async function getDpoRecordsData(searchParams: Query): Promise<DpoRecordsData> {
  const department = getParam(searchParams, "department");
  const dataType = getParam(searchParams, "dataType");
  const legalBasis = getParam(searchParams, "legalBasis");

  const mockRows = normalizeMockRows(listMockRopa());
  let baseRows: DpoRecordRow[];
  let source: "api" | "mock";
  let loadError: string | null = null;

  if (shouldUseMockData()) {
    baseRows = mockRows;
    source = "mock";
  } else {
    const session = await getLiveApiSession();
    if (!session.ok) {
      baseRows = [];
      source = "api";
      loadError = session.error;
    } else {
      const apiRows = await fetchApiRows();
      if (apiRows) {
        baseRows = apiRows;
        source = "api";
      } else {
        baseRows = [];
        source = "api";
        loadError = "โหลดบันทึกกิจกรรมจากเซิร์ฟเวอร์ไม่สำเร็จ";
      }
    }
  }

  const rows = filterRows(baseRows, department, dataType, legalBasis);

  return {
    source,
    loadError,
    rows,
    filters: { department, dataType, legalBasis },
    departments: [...new Set(baseRows.map((x) => x.department))],
    dataTypes: [...new Set(baseRows.map((x) => x.dataType))],
    legalBases: [...new Set(baseRows.map((x) => x.legalBasis))],
  };
}
