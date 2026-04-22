import { apiPathRopaList } from "@/config/api-endpoints";
import { getSessionUser } from "@/lib/auth/get-session-user";
import { listMockRopa } from "@/lib/data/mock-ropa-store";
import type { ItemStatus, MyItemRecord, MyItemsPageData } from "@/types/records";
import { getLiveApiSession } from "@/lib/data/api-session";
import { shouldUseMockData } from "./runtime";
const PAGE_SIZE = 9999;

type Query = Record<string, string | string[] | undefined>;

type ApiRopaEntry = {
  id: string;
  processName: string;
  status: string;
  updatedAt: string;
  createdAt: string;
  referenceCode?: string;
  department?: { name?: string | null } | null;
  createdBy?: { id?: string | null } | null;
};

function getParam(q: Query, key: string): string {
  const v = q[key];
  const val = Array.isArray(v) ? v[0] : v;
  return (val ?? "").trim();
}

function toThaiDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

function mapStatus(status: string): ItemStatus {
  const s = status.toUpperCase();
  if (s === "DRAFT") return "draft";
  if (s === "COMPLETE" || s === "APPROVED") return "approved";
  if (s === "REJECTED" || s === "NEEDS_FIX") return "needs_fix";
  if (s === "PENDING" || s === "SUBMITTED" || s === "IN_REVIEW") return "pending";
  return "pending";
}

function codeFromRow(row: ApiRopaEntry, index: number): string {
  if (row.referenceCode && row.referenceCode.trim()) return row.referenceCode.trim();
  const year = new Date(row.createdAt).getFullYear() || 2023;
  const suffix = String(index + 1).padStart(3, "0");
  return `ROPA-${year}-${suffix}`;
}

function normalizeFromApi(rows: ApiRopaEntry[]): MyItemRecord[] {
  return rows.map((row, index) => ({
    id: row.id,
    code: codeFromRow(row, index),
    activityName: row.processName || "-",
    updatedAtLabel: toThaiDateLabel(row.updatedAt),
    departmentName: row.department?.name || "ไม่ระบุแผนก",
    status: mapStatus(row.status),
  }));
}

function collectStats(rows: MyItemRecord[]) {
  return {
    total: rows.length,
    draft: rows.filter((r) => r.status === "draft").length,
    pending: rows.filter((r) => r.status === "pending").length,
    needsFix: rows.filter((r) => r.status === "needs_fix").length,
    approved: rows.filter((r) => r.status === "approved").length,
  };
}

function applyFilters(rows: MyItemRecord[], q: string, status: string, department: string) {
  return rows.filter((row) => {
    const matchesQ =
      !q ||
      row.code.toLowerCase().includes(q) ||
      row.activityName.toLowerCase().includes(q) ||
      row.departmentName.toLowerCase().includes(q);

    const matchesStatus = status === "all" || row.status === status;
    const matchesDepartment = !department || row.departmentName === department;

    return matchesQ && matchesStatus && matchesDepartment;
  });
}

async function fetchApiRows(ownerId?: string): Promise<MyItemRecord[] | null> {
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
    const scopedRows = ownerId
      ? json.filter((row) => String(row.createdBy?.id || "") === ownerId)
      : json;
    return normalizeFromApi(scopedRows);
  } catch {
    return null;
  }
}

export async function getMyItemsPageData(searchParams: Query): Promise<MyItemsPageData> {
  const q = getParam(searchParams, "q").toLowerCase();
  const status = (getParam(searchParams, "status") || "all") as "all" | ItemStatus;
  const department = getParam(searchParams, "department");

  const user = await getSessionUser();
  const ownerId = user?.id;
  const missingOwnerIdentity = !shouldUseMockData() && user?.role === "DATA_OWNER" && !ownerId;

  const mockRows = normalizeFromApi(
    listMockRopa().map((row) => ({
      id: row.id,
      processName: row.processName,
      status: row.status,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
      referenceCode: row.referenceCode,
      department: row.department ?? null,
    })),
  );

  let rawRows: MyItemRecord[];
  let source: "api" | "mock";
  let loadError: string | null = null;

  if (shouldUseMockData()) {
    rawRows = mockRows;
    source = "mock";
  } else {
    if (missingOwnerIdentity) {
      rawRows = [];
      source = "api";
      loadError = "ไม่พบข้อมูลผู้ใช้ใน session กรุณาเข้าสู่ระบบใหม่";
    } else {
    const session = await getLiveApiSession();
    if (!session.ok) {
      rawRows = [];
      source = "api";
      loadError = session.error;
    } else {
      const apiRows = await fetchApiRows(ownerId);
      if (apiRows) {
        rawRows = apiRows;
        source = "api";
      } else {
        rawRows = [];
        source = "api";
        loadError = "โหลดรายการ ROPA จากเซิร์ฟเวอร์ไม่สำเร็จ";
      }
    }
    }
  }

  const filteredRows = applyFilters(rawRows, q, status, department);
  const pagedRows = filteredRows;

  const departments = [...new Set(rawRows.map((r) => r.departmentName))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );

  return {
    source,
    loadError,
    rows: pagedRows,
    stats: collectStats(rawRows),
    departments,
    currentPage: 1,
    totalPages: 1,
    pageSize: PAGE_SIZE,
    filters: {
      q: getParam(searchParams, "q"),
      status,
      department,
    },
  };
}
