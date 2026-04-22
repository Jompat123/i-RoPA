import { apiPathRopaList } from "@/config/api-endpoints";
import { dpoDashboardMock } from "@/data/dpo-mock";
import { listMockRopa } from "@/lib/data/mock-ropa-store";
import type { DpoDashboardData, DpoReviewStatus } from "@/types/dpo";
import { getLiveApiSession } from "@/lib/data/api-session";
import { shouldUseMockData } from "./runtime";

type ApiRopa = {
  id: string;
  referenceCode?: string | null;
  processName?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  legalBasis?: string | null;
  dataType?: string | null;
  revisionCount?: number | null;
  version?: number | null;
  isUpdate?: boolean | null;
  department?: { name?: string | null } | null;
  createdBy?: { name?: string | null } | null;
};

function statusFromApi(status: string): DpoReviewStatus {
  const s = status.toUpperCase();
  if (s === "COMPLETE" || s === "APPROVED") return "approved";
  if (s === "REJECTED" || s === "NEEDS_FIX") return "needs_fix";
  if (s === "PENDING" || s === "SUBMITTED" || s === "IN_REVIEW") return "pending";
  return "pending";
}

function thaiDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 543}`;
}

function asPositiveInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value > 0 ? Math.floor(value) : 0;
}

function isUpdatedSubmission(row: ApiRopa): boolean {
  if (typeof row.isUpdate === "boolean") return row.isUpdate;
  const revision = asPositiveInt(row.revisionCount);
  if (revision !== null) return revision > 0;
  const version = asPositiveInt(row.version);
  if (version !== null) return version > 1;
  return false;
}

async function fetchApi(): Promise<DpoDashboardData | null> {
  const session = await getLiveApiSession();
  if (!session.ok) return null;

  try {
    const res = await fetch(`${session.base.replace(/\/$/, "")}${apiPathRopaList()}`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as ApiRopa[];
    if (!Array.isArray(rows)) return null;
    return fromRows(rows, "api");
  } catch {
    return null;
  }
}

function emptyDpoDashboard(loadError: string): DpoDashboardData {
  return {
    source: "api",
    loadError,
    summary: { pending: 0, approved: 0, needsFix: 0 },
    workflow: { newPending: 0, updatePending: 0, revisionRequired: 0, alertCount: 0 },
    departmentStatus: [],
    legalBasisDistribution: [],
    latestQueue: [],
    recentLogs: [],
  };
}

function fromRows(rows: ApiRopa[], source: "api" | "mock"): DpoDashboardData {
  const withoutDraft = rows.filter((row) => String(row.status || "").toUpperCase() !== "DRAFT");

  const normalized = withoutDraft.map((row, i) => {
    const status = statusFromApi(row.status || "");
    const updated = isUpdatedSubmission(row);
    return {
      id: row.id,
      code:
        row.referenceCode?.trim() ||
        `ROPA-${new Date().getFullYear()}-${String(i + 1).padStart(3, "0")}`,
      processName: row.processName?.trim() || "-",
      department: row.department?.name || "Unknown",
      submittedAtLabel: thaiDate(row.updatedAt || ""),
      ownerName: row.createdBy?.name || "-",
      status,
      legalBasis: row.legalBasis || "",
      dataType: String(row.dataType || "").trim().toUpperCase(),
      updated,
    };
  });

  const departmentStatus = [...new Set(normalized.map((x) => x.department))]
    .map((department) => {
      const group = normalized.filter((x) => x.department === department);
      return {
        department,
        approved: group.filter((x) => x.status === "approved").length,
        pending: group.filter((x) => x.status === "pending").length,
        needsFix: group.filter((x) => x.status === "needs_fix").length,
      };
    })
    .sort((a, b) => a.department.localeCompare(b.department, "th"))
    .slice(0, 4);

  const sensitiveByDepartment = new Map<string, number>();
  normalized.forEach((row) => {
    if (row.dataType !== "SENSITIVE") return;
    sensitiveByDepartment.set(row.department, (sensitiveByDepartment.get(row.department) ?? 0) + 1);
  });

  const legalBasisDistribution = [...sensitiveByDepartment.entries()]
    .map(([department, count]) => ({
      key: department.toLowerCase().replace(/\s+/g, "_"),
      label: department,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    source,
    loadError: null,
    summary: {
      pending: normalized.filter((r) => r.status === "pending").length,
      approved: normalized.filter((r) => r.status === "approved").length,
      needsFix: normalized.filter((r) => r.status === "needs_fix").length,
    },
    workflow: {
      newPending: normalized.filter((r) => r.status === "pending" && !r.updated).length,
      updatePending: normalized.filter((r) => r.status === "pending" && r.updated).length,
      revisionRequired: normalized.filter((r) => r.status === "needs_fix").length,
      alertCount: normalized.filter((r) => r.status !== "approved").length,
    },
    departmentStatus,
    legalBasisDistribution,
    latestQueue: normalized.slice(0, 6).map((row) => ({
      id: row.id,
      code: row.code,
      processName: row.processName,
      department: row.department,
      submittedAtLabel: row.submittedAtLabel,
      ownerName: row.ownerName,
      status: row.status,
    })),
    recentLogs: source === "mock" ? dpoDashboardMock.recentLogs : [],
  };
}

export async function getDpoDashboardData(): Promise<DpoDashboardData> {
  if (shouldUseMockData()) {
    const mockRows = listMockRopa().map((row) => ({
      id: row.id,
      referenceCode: row.referenceCode,
      processName: row.processName,
      status: row.status,
      updatedAt: row.updatedAt,
      legalBasis: row.legalBasis ?? null,
      dataType: row.dataType ?? null,
      revisionCount: row.reviewChecks?.length ?? null,
      version: null,
      isUpdate: null,
      department: row.department ?? null,
      createdBy: row.createdBy ?? null,
    }));
    return fromRows(mockRows, "mock");
  }
  const api = await fetchApi();
  if (api) {
    return { ...api, loadError: null };
  }
  const session = await getLiveApiSession();
  if (!session.ok) {
    return emptyDpoDashboard(session.error);
  }
  return emptyDpoDashboard("โหลดข้อมูลแดชบอร์ด DPO ไม่สำเร็จ");
}
