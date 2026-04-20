import {
  recentActivities,
  summaryCards,
  taskList,
  type RecentActivity,
  type SummaryCard,
} from "@/data/dashboard-mock";

import { apiPathDataOwnerDashboardSummary } from "@/config/api-endpoints";
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
  /** mock = ข้อมูลจำลอง, empty = รอ endpoint รายการงาน/กิจกรรม */
  tasksSource: "mock" | "empty";
  taskList: string[];
  recentActivities: RecentActivity[];
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
    };
  }

  const path = apiPathDataOwnerDashboardSummary();
  try {
    const res = await fetch(`${session.base.replace(/\/$/, "")}${path}`, {
      headers: { Authorization: `Bearer ${session.token}` },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return {
        summarySource: "api",
        summaryLoadError: "โหลดสรุปแดชบอร์ดไม่สำเร็จ — ลองใหม่ภายหลัง",
        summaryCards: emptySummaryCards(),
        tasksSource: "empty",
        taskList: [],
        recentActivities: [],
      };
    }

    const json = (await res.json()) as ApiDashboardSummary;
    return {
      summarySource: "api",
      summaryLoadError: null,
      summaryCards: mapApiSummaryToCards(json),
      tasksSource: "empty",
      taskList: [],
      recentActivities: [],
    };
  } catch {
    return {
      summarySource: "api",
      summaryLoadError: "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ",
      summaryCards: emptySummaryCards(),
      tasksSource: "empty",
      taskList: [],
      recentActivities: [],
    };
  }
}
