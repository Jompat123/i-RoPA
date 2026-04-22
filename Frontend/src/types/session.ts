export type AppRole = "ADMIN" | "DATA_OWNER" | "DPO";

/**
 * ข้อมูลผู้ใช้สำหรับแสดงใน Topbar หลังล็อกอินสำเร็จ
 * ตั้งค่า cookie `iropa_user` (JSON) จาก route ล็อกอิน หรือจาก API หลัง verify token
 */
export type SessionUser = {
  id?: string;
  name: string;
  /** ข้อความบทบาทที่แสดง เช่น Data Owner, Admin */
  roleLabel: string;
  /** role กลางสำหรับ route/menu guard */
  role?: AppRole;
  /** URL รูปโปรไฟล์ — ใส่เมื่อ backend / OAuth ส่งมา */
  avatarUrl?: string | null;
};
