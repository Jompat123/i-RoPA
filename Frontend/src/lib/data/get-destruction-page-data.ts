import { destructionMockRows } from "@/data/records-mock";
import type { DestructionPageData, DestructionRow, DestructionStatus } from "@/types/records";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "./runtime";
const PAGE_SIZE = 9999;

type Query = Record<string, string | string[] | undefined>;

type ApiRopaEntry = {
  id: string;
  processName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  retentionPeriod?: string | null;
  destructionProofUrl?: string | null;
  proofUrl?: string | null;
  department?: { name?: string | null } | null;
};

function getParam(q: Query, key: string): string {
  const v = q[key];
  const val = Array.isArray(v) ? v[0] : v;
  return (val ?? "").trim();
}

function toThaiLongDate(value: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

function deriveStatusByDate(createdAt: string, currentStatus: string): DestructionStatus {
  if (currentStatus === "COMPLETE") return "destroyed";
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "near_expiry";
  const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  if (days > 360) return "expired";
  return "near_expiry";
}

function normalizeFromApi(rows: ApiRopaEntry[]): DestructionRow[] {
  return rows.map((row) => {
    const status = deriveStatusByDate(row.createdAt, row.status);
    const dueDate = new Date(row.createdAt);
    dueDate.setDate(dueDate.getDate() + 365);
    const dueDateIso = dueDate.toISOString().slice(0, 10);

    const proofUrl = row.destructionProofUrl ?? row.proofUrl ?? null;

    return {
      id: row.id,
      activityName: row.processName || "-",
      departmentName: row.department?.name || "ไม่ระบุแผนก",
      dueDateLabel: toThaiLongDate(dueDate),
      dueDateIso,
      status,
      proofUrl,
      proofLabel: proofUrl ? "ดูหลักฐาน (PDF)" : "รอการอัปโหลด",
    };
  });
}

function parseYmdToMs(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(`${trimmed}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

function applyFilters(rows: DestructionRow[], filters: DestructionPageData["filters"]) {
  const q = filters.q.toLowerCase();
  const startMs = parseYmdToMs(filters.startDate);
  const endMs = parseYmdToMs(filters.endDate);
  return rows.filter((row) => {
    const byQ =
      !q ||
      row.activityName.toLowerCase().includes(q) ||
      row.departmentName.toLowerCase().includes(q);
    const byStatus = filters.status === "all" || row.status === filters.status;
    const byDepartment = !filters.department || row.departmentName === filters.department;
    const rowMs = parseYmdToMs(row.dueDateIso);
    const byDateRange =
      (startMs === null && endMs === null) ||
      rowMs === null ||
      ((startMs === null || rowMs >= startMs) && (endMs === null || rowMs <= endMs));
    return byQ && byStatus && byDepartment && byDateRange;
  });
}

async function fetchApiRows(): Promise<DestructionRow[] | null> {
  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();
  if (!base || !token) return null;

  try {
    const res = await fetch(`${base}/api/ropa`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiRopaEntry[];
    if (!Array.isArray(json)) return null;
    return normalizeFromApi(json);
  } catch {
    return null;
  }
}

export async function getDestructionPageData(searchParams: Query): Promise<DestructionPageData> {
  const filters: DestructionPageData["filters"] = {
    q: getParam(searchParams, "q"),
    status: (getParam(searchParams, "status") || "all") as "all" | DestructionStatus,
    department: getParam(searchParams, "department"),
    startDate: getParam(searchParams, "startDate"),
    endDate: getParam(searchParams, "endDate"),
  };

  const apiRows = shouldUseMockData() ? null : await fetchApiRows();
  const source: "api" | "mock" = apiRows ? "api" : "mock";
  const rawRows = apiRows ?? destructionMockRows;
  const filteredRows = applyFilters(rawRows, filters);
  const rows = filteredRows;

  const departments = [...new Set(rawRows.map((row) => row.departmentName))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );

  return {
    source,
    rows,
    departments,
    currentPage: 1,
    totalPages: 1,
    pageSize: PAGE_SIZE,
    totalItems: filteredRows.length,
    filters,
  };
}
