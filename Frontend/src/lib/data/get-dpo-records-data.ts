import { dpoRecordsMock } from "@/data/dpo-mock";
import { listMockRopa } from "@/lib/data/mock-ropa-store";
import type { DpoRecordRow, DpoRecordsData } from "@/types/dpo";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "./runtime";

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
};

function getParam(q: Query, key: string): string {
  const raw = q[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim();
}

function normalizeRows(rows: ApiRopa[]): DpoRecordRow[] {
  return rows
    .filter((row) => {
      const status = String(row.status || "").toUpperCase();
      return status === "COMPLETE" || status === "APPROVED";
    })
    .map((row) => ({
      id: row.id,
      processName: row.processName || "-",
      department: row.department?.name || "Unknown",
      purpose: row.purpose || "-",
      dataType: row.dataType || "-",
      legalBasis: row.legalBasis || "-",
      retentionPeriod: row.retentionPeriod || "-",
      security: "-",
    }));
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
  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return null;

  try {
    const res = await fetch(`${base}/api/ropa`, {
      headers: { Authorization: `Bearer ${token}` },
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

  const mockRows = normalizeRows(
    listMockRopa().map((row) => ({
      id: row.id,
      processName: row.processName,
      status: row.status,
      department: row.department ?? null,
      legalBasis: row.legalBasis ?? null,
      retentionPeriod: row.retentionPeriod ?? null,
      dataType: row.dataType ?? null,
      purpose: row.purpose ?? null,
    })),
  );
  const apiRows = shouldUseMockData() ? null : await fetchApiRows();
  const source: "api" | "mock" = apiRows ? "api" : "mock";
  const baseRows = apiRows ?? (shouldUseMockData() ? mockRows : dpoRecordsMock.rows);
  const rows = filterRows(baseRows, department, dataType, legalBasis);

  return {
    source,
    rows,
    filters: { department, dataType, legalBasis },
    departments: [...new Set(baseRows.map((x) => x.department))],
    dataTypes: [...new Set(baseRows.map((x) => x.dataType))],
    legalBases: [...new Set(baseRows.map((x) => x.legalBasis))],
  };
}
