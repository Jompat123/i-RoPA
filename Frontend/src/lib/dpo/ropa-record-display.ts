import type { DpoRecordRow, RopaEntityRole } from "@/types/dpo";

/** ข้อ 14 — ผู้ประมวลผลไม่กรอกในฟอร์มนี้ */
export const PROCESSOR_RIGHTS_NA =
  "ไม่เกี่ยวข้อง (ผู้ประมวลผล — แบบฟอร์มไม่มีข้อ 14)";

/** ข้อ 15 — ผู้ประมวลผลไม่กรอกในฟอร์มนี้ */
export const PROCESSOR_SECURITY_NA =
  "ไม่เกี่ยวข้อง (ผู้ประมวลผล — แบบฟอร์มไม่มีข้อ 15)";

export function roleLabelTh(role: RopaEntityRole): string {
  return role === "controller" ? "ผู้ควบคุม (Controller)" : "ผู้ประมวลผล (Processor)";
}

/** ข้อ 14 สำหรับตาราง / export */
export function rightsRefusalDisplay(row: DpoRecordRow): string {
  if (row.role === "processor") return PROCESSOR_RIGHTS_NA;
  return row.rightsRefusalNote?.trim() || "—";
}

/** ข้อ 15 สำหรับตาราง / export */
export function securityMeasuresDisplay(row: DpoRecordRow): string {
  if (row.role === "processor") return PROCESSOR_SECURITY_NA;
  return row.securityMeasuresSummary?.trim() || "—";
}
