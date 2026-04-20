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

function fromMockEntry(row: MockRopaEntry): DpoRecordRow {
  const role: RopaEntityRole = row.ropaRole === "processor" ? "processor" : "controller";
  return {
    id: row.id,
    role,
    processName: row.processName || "-",
    department: row.department?.name || "Unknown",
    purpose: row.purpose || "-",
    dataType: row.dataType || "-",
    legalBasis: row.legalBasis || "-",
    retentionPeriod: row.retentionPeriod || "-",
    rightsRefusalNote: role === "processor" ? null : row.rightsRefusalNote ?? null,
    securityMeasuresSummary: buildSecuritySummary(role, row.securityTech, row.securityPhysical, row.securityOrg),
  };
}

function fromApiEntry(row: ApiRopa): DpoRecordRow {
  const role = parseApiRole(row.ropaRole ?? row.dataControllerRole);
  return {
    id: row.id,
    role,
    processName: row.processName || "-",
    department: row.department?.name || "Unknown",
    purpose: row.purpose || "-",
    dataType: row.dataType || "-",
    legalBasis: row.legalBasis || "-",
    retentionPeriod: row.retentionPeriod || "-",
    rightsRefusalNote: role === "processor" ? null : row.rightsRefusalNote ?? null,
    securityMeasuresSummary: buildSecuritySummary(
      role,
      row.securityTech,
      row.securityPhysical,
      row.securityOrg,
    ),
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
