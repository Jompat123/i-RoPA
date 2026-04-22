import {
  recentActivities,
  summaryCards,
  taskList,
  type RecentActivity,
  type SummaryCard,
} from "@/data/dashboard-mock";

import { apiPathDataOwnerDashboardSummary, apiPathRopaList } from "@/config/api-endpoints";
import { getLiveApiSession } from "@/lib/data/api-session";
import {
  mapApiSummaryToCards,
  emptySummaryCards,
  type ApiDashboardSummary,
} from "./map-dashboard-summary";
import { shouldUseMockData } from "./runtime";

export type DashboardPageData = {
  summarySource: "api" | "mock";
  summaryLoadError?: string | null;
  summaryCards: SummaryCard[];
  /** mock = ข้อมูลจำลอง, api = ข้อมูลจริง, empty = โหลดไม่สำเร็จ */
  tasksSource: "mock" | "api" | "empty";
  taskList: string[];
  recentActivities: RecentActivity[];
  expiringSoon: Array<{
    id: string;
    processName: string;
    department: string;
    dueDateLabel: string;
    daysLeft: number;
  }>;
};

function toActivityStatus(status?: string): RecentActivity["status"] {
  const s = String(status || "").toUpperCase();
  if (s === "NEEDS_FIX" || s === "REJECTED") return "edit";
  if (s === "APPROVED" || s === "COMPLETE") return "approved";
  return "pending";
}

function thaiDate(value?: string): string {
  const d = new Date(String(value || ""));
  if (Number.isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 543}`;
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

function computeDueDate(createdAt?: string | null, retentionPeriod?: string | null): Date | null {
  const created = new Date(String(createdAt || ""));
  if (Number.isNaN(created.getTime())) return null;
  const years = parseRetentionYears(retentionPeriod) ?? 1;
  const dueDate = new Date(created);
  dueDate.setFullYear(dueDate.getFullYear() + years);
  return dueDate;
}

function daysUntil(date: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const now = new Date();
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.floor((startTarget - startNow) / msPerDay);
}

type ApiRopaForExpiry = {
  id?: string;
  processName?: string | null;
  createdAt?: string | null;
  retentionPeriod?: string | null;
  destructionConfirmedAt?: string | null;
  destructionProofUrl?: string | null;
  department?: { name?: string | null } | null;
};

export async function getDashboardPageData(): Promise<DashboardPageData> {
  if (shouldUseMockData()) {
    return {
      summarySource: "mock",
      summaryLoadError: null,
      summaryCards,
      tasksSource: "mock",
      taskList,
      recentActivities,
      expiringSoon: [],
    };
  }

  const session = await getLiveApiSession();
  if (!session.ok) {
    return {
      summarySource: "api",
      summaryLoadError: session.error,
      summaryCards: emptySummaryCards(),
      tasksSource: "empty",
      taskList: [],
      recentActivities: [],
      expiringSoon: [],
    };
  }

  const path = apiPathDataOwnerDashboardSummary();
  try {
    const base = session.base.replace(/\/$/, "");
    const [summaryRes, ropaRes] = await Promise.all([
      fetch(`${base}${path}`, {
        headers: { Authorization: `Bearer ${session.token}` },
        next: { revalidate: 30 },
      }),
      fetch(`${base}${apiPathRopaList()}`, {
        headers: { Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      }),
    ]);

    if (!summaryRes.ok) {
      return {
        summarySource: "api",
        summaryLoadError: "โหลดสรุปแดชบอร์ดไม่สำเร็จ — ลองใหม่ภายหลัง",
        summaryCards: emptySummaryCards(),
        tasksSource: "empty",
        taskList: [],
        recentActivities: [],
        expiringSoon: [],
      };
    }

    const json = (await summaryRes.json()) as ApiDashboardSummary;
    const by = json.byStatus ?? {};
    const pending = (by.PENDING ?? 0) + (by.DRAFT ?? 0);
    const needsFix = by.NEEDS_FIX ?? by.REJECTED ?? 0;
    const taskList: string[] = [];
    if (pending > 0) taskList.push(`มี ${pending} รายการรอการอนุมัติ`);
    if (needsFix > 0) taskList.push(`มี ${needsFix} รายการต้องแก้ไข`);
    if (taskList.length === 0) taskList.push("ไม่มีรายการค้าง — งานล่าสุดอยู่ในสถานะปกติ");

    const recentActivities = Array.isArray(json.recentActivities)
      ? (json.recentActivities
          .slice(0, 10)
          .map((row, idx) => ({
            id: idx + 1,
            name: row.processName || "-",
            department: row.departmentName || "-",
            date: thaiDate(row.updatedAt),
            status: toActivityStatus(row.status),
          })))
      : [];
    const ropaRows = ropaRes.ok ? ((await ropaRes.json()) as ApiRopaForExpiry[]) : [];
    const expiringSoon = Array.isArray(ropaRows)
      ? ropaRows
          .map((row) => {
            const dueDate = computeDueDate(row.createdAt, row.retentionPeriod);
            if (!dueDate || !row.id) return null;
            const daysLeft = daysUntil(dueDate);
            const isDestroyed = Boolean(
              String(row.destructionProofUrl || "").trim() || String(row.destructionConfirmedAt || "").trim(),
            );
            if (isDestroyed || daysLeft < 0 || daysLeft > 7) return null;
            return {
              id: String(row.id),
              processName: row.processName?.trim() || "-",
              department: row.department?.name || "-",
              dueDateLabel: thaiDate(dueDate.toISOString()),
              daysLeft,
            };
          })
          .filter((x): x is NonNullable<typeof x> => Boolean(x))
          .sort((a, b) => a.daysLeft - b.daysLeft)
          .slice(0, 8)
      : [];

    return {
      summarySource: "api",
      summaryLoadError: null,
      summaryCards: mapApiSummaryToCards(json),
      tasksSource: "api",
      taskList,
      recentActivities,
      expiringSoon,
    };
  } catch {
    return {
      summarySource: "api",
      summaryLoadError: "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ",
      summaryCards: emptySummaryCards(),
      tasksSource: "empty",
      taskList: [],
      recentActivities: [],
      expiringSoon: [],
    };
  }
}
