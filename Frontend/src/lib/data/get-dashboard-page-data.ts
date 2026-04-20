import {
  recentActivities,
  summaryCards,
  taskList,
  type RecentActivity,
  type SummaryCard,
} from "@/data/dashboard-mock";

import { mapApiSummaryToCards, type ApiDashboardSummary } from "./map-dashboard-summary";
import { getApiBaseUrl, getAuthTokenFromCookie, shouldUseMockData } from "./runtime";

export type DashboardPageData = {
  /** การ์ดสรุปมาจาก API หรือยังใช้ mock */
  summarySource: "api" | "mock";
  summaryCards: SummaryCard[];
  /** รายการงาน / ตาราง — รอ endpoint จริง; ตอนนี้ยังเป็นข้อมูลจำลอง */
  tasksSource: "mock";
  taskList: string[];
  recentActivities: RecentActivity[];
};

export async function getDashboardPageData(): Promise<DashboardPageData> {
  const base = getApiBaseUrl();
  const token = await getAuthTokenFromCookie();

  if (shouldUseMockData() || !base || !token) {
    return {
      summarySource: "mock",
      tasksSource: "mock",
      summaryCards,
      taskList,
      recentActivities,
    };
  }

  try {
    const res = await fetch(`${base}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return {
        summarySource: "mock",
        tasksSource: "mock",
        summaryCards,
        taskList,
        recentActivities,
      };
    }

    const json = (await res.json()) as ApiDashboardSummary;
    return {
      summarySource: "api",
      tasksSource: "mock",
      summaryCards: mapApiSummaryToCards(json),
      taskList,
      recentActivities,
    };
  } catch {
    return {
      summarySource: "mock",
      tasksSource: "mock",
      summaryCards,
      taskList,
      recentActivities,
    };
  }
}
