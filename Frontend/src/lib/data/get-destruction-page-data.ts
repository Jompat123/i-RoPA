import { apiPathRopaList } from "@/config/api-endpoints";
import { destructionMockRows } from "@/data/records-mock";
import { listMockRopa } from "@/lib/data/mock-ropa-store";
import type { DestructionPageData, DestructionRow, DestructionStatus } from "@/types/records";
import { getLiveApiSession } from "@/lib/data/api-session";
import { shouldUseMockData } from "./runtime";
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

function parseRetentionYears(retentionPeriod?: string | null): number | null {
  const raw = String(retentionPeriod ?? "").trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("ตลอดสัญญา") || raw.includes("contract")) return null;
  const matched = raw.match(/\d+/);
  if (!matched) return null;
  const years = Number.parseInt(matched[0], 10);
  if (!Number.isFinite(years) || years <= 0) return null;
  return years;
}

function computeDueDate(createdAt: string, retentionPeriod?: string | null): Date | null {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const years = parseRetentionYears(retentionPeriod) ?? 1;
  const dueDate = new Date(created);
  dueDate.setFullYear(dueDate.getFullYear() + years);
  return dueDate;
}

function deriveStatusByDate(dueDate: Date | null, proofUrl: string | null): DestructionStatus {
  if (proofUrl) return "destroyed";
  if (!dueDate) return "near_expiry";
  if (dueDate.getTime() < Date.now()) return "expired";
  return "near_expiry";
}

function formatDueDate(dueDate: Date | null): { label: string; iso: string } {
  if (!dueDate) {
    return { label: "ไม่ระบุวันครบกำหนด", iso: "" };
  }
  return {
    label: toThaiLongDate(dueDate),
    iso: dueDate.toISOString().slice(0, 10),
  };
}

function normalizeFromApi(rows: ApiRopaEntry[]): DestructionRow[] {
  return rows
    .filter((row) => {
      const status = String(row.status || "").toUpperCase();
      return status === "APPROVED" || status === "COMPLETE";
    })
    .map((row) => {
    const proofUrl = row.destructionProofUrl ?? row.proofUrl ?? null;
    const dueDate = computeDueDate(row.createdAt, row.retentionPeriod);
    const dueDateMeta = formatDueDate(dueDate);
    const status = deriveStatusByDate(dueDate, proofUrl);

    return {
      id: row.id,
      activityName: row.processName || "-",
      departmentName: row.department?.name || "ไม่ระบุแผนก",
      dueDateLabel: dueDateMeta.label,
      dueDateIso: dueDateMeta.iso,
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
  const session = await getLiveApiSession();
  if (!session.ok) return null;

  try {
    const res = await fetch(`${session.base.replace(/\/$/, "")}${apiPathRopaList()}`, {
      headers: { Authorization: `Bearer ${session.token}` },
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

  let rawRows: DestructionRow[];
  let source: "api" | "mock";
  let loadError: string | null = null;

  if (shouldUseMockData()) {
    const dynamicMockRows = normalizeFromApi(
      listMockRopa().map((row) => ({
        id: row.id,
        processName: row.processName,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        retentionPeriod: row.retentionPeriod ?? null,
        destructionProofUrl: row.destructionProofUrl ?? null,
        proofUrl: row.destructionProofUrl ?? null,
        department: row.department ?? null,
      })),
    );
    rawRows = dynamicMockRows.length ? dynamicMockRows : destructionMockRows;
    source = "mock";
  } else {
    const session = await getLiveApiSession();
    if (!session.ok) {
      rawRows = [];
      source = "api";
      loadError = session.error;
    } else {
      const apiRows = await fetchApiRows();
      if (apiRows) {
        rawRows = apiRows;
        source = "api";
      } else {
        rawRows = [];
        source = "api";
        loadError = "โหลดข้อมูลการทำลายจากเซิร์ฟเวอร์ไม่สำเร็จ — หมายเหตุ: ควรมี endpoint เฉพาะเมื่อ backend พร้อม";
      }
    }
  }
  const filteredRows = applyFilters(rawRows, filters);
  const rows = filteredRows;

  const departments = [...new Set(rawRows.map((row) => row.departmentName))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );

  return {
    source,
    loadError,
    rows,
    departments,
    currentPage: 1,
    totalPages: 1,
    pageSize: PAGE_SIZE,
    totalItems: filteredRows.length,
    filters,
  };
}
