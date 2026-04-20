export type SummaryCardType = "total" | "pending" | "edit" | "approved";

export type SummaryCard = {
  id: number;
  title: string;
  count: number;
  type: SummaryCardType;
};

export type ActivityStatus = "edit" | "pending" | "approved";

export type RecentActivity = {
  id: number;
  name: string;
  department: string;
  date: string;
  status: ActivityStatus;
};

/** ข้อมูลจำลอง — แทนที่ด้วยการดึงจาก API ภายหลัง */
export const summaryCards: SummaryCard[] = [
  { id: 1, title: "รายการทั้งหมด", count: 128, type: "total" },
  { id: 2, title: "รอการอนุมัติ", count: 15, type: "pending" },
  { id: 3, title: "ต้องแก้ไข", count: 8, type: "edit" },
  { id: 4, title: "อนุมัติแล้ว", count: 105, type: "approved" },
];

export const taskList: string[] = [
  "แก้ไข ROPA สำหรับแผนก HR (DPO: แก้ไขความปลอดภัยข้อมูล)",
  "ตรวจสอบ ROPA ที่รออนุมัติ",
  "อัปเดตข้อมูลกิจกรรมรับสมัครพนักงาน",
];

export const recentActivities: RecentActivity[] = [
  {
    id: 1,
    name: "ระบบรับสมัครพนักงาน",
    department: "HR",
    date: "24/10/2023",
    status: "edit",
  },
  {
    id: 2,
    name: "ข้อมูลลูกค้า",
    department: "Marketing",
    date: "23/10/2023",
    status: "pending",
  },
  {
    id: 3,
    name: "การประเมินพนักงาน",
    department: "HR",
    date: "22/10/2023",
    status: "approved",
  },
  {
    id: 4,
    name: "รายชื่อคู่ค้า",
    department: "Procurement",
    date: "21/10/2023",
    status: "approved",
  },
  {
    id: 5,
    name: "ข้อมูลผู้ใช้งาน",
    department: "IT",
    date: "20/10/2023",
    status: "edit",
  },
];
