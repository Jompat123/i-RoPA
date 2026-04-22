import type { SummaryCard } from "@/data/dashboard-mock";

const SUMMARY_TITLES: Record<SummaryCard["type"], string> = {
  total: "รายการทั้งหมด",
  pending: "รอการอนุมัติ",
  edit: "ต้องแก้ไข",
  approved: "อนุมัติแล้ว",
};

const SUMMARY_TYPES: SummaryCard["type"][] = ["total", "pending", "edit", "approved"];

/** การ์ดสรุปเป็นศูนย์ — ใช้เมื่อโหลด API ไม่สำเร็จและไม่ต้องการแสดงตัวเลขจำลอง */
export function emptySummaryCards(): SummaryCard[] {
  return SUMMARY_TYPES.map((type, index) => ({
    id: index + 1,
    title: SUMMARY_TITLES[type],
    count: 0,
    type,
  }));
}

/** รูปแบบตอบจาก Backend `GET /dashboard/summary` */
export type ApiDashboardSummary = {
  totalRopa: number;
  byStatus?: Record<string, number>;
  recentActivities?: Array<{
    id?: string;
    processName?: string;
    departmentName?: string;
    status?: string;
    updatedAt?: string;
  }>;
};

export function mapApiSummaryToCards(api: ApiDashboardSummary): SummaryCard[] {
  const by = api.byStatus ?? {};
  const pending = (by.PENDING ?? 0) + (by.DRAFT ?? 0);
  const needsFix = by.NEEDS_FIX ?? by.REJECTED ?? 0;
  const approved = (by.APPROVED ?? 0) + (by.COMPLETE ?? 0);

  const counts = {
    total: api.totalRopa,
    pending,
    edit: needsFix,
    approved,
  } as const;

  return SUMMARY_TYPES.map((type, index) => ({
    id: index + 1,
    title: SUMMARY_TITLES[type],
    count: counts[type],
    type,
  }));
}
