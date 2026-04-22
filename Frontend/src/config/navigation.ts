import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgeCheck,
  ClipboardList,
  FileBarChart2,
  Home,
  ListChecks,
  Settings,
  ShieldCheck,
  Users2,
} from "lucide-react";
import type { AppRole } from "@/types/session";

export type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const dataOwnerNav: NavItem[] = [
  { href: "/", label: "หน้าแรก", Icon: Home },
  { href: "/reports", label: "สร้าง ROPA", Icon: FileBarChart2 },
  { href: "/activities", label: "บันทึกรายการกิจกรรม", Icon: ClipboardList },
  { href: "/destruction", label: "ตรวจสอบการทำลายข้อมูล", Icon: ShieldCheck },
  { href: "/settings", label: "ตั้งค่า", Icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "หน้าแรก", Icon: Home },
  { href: "/admin/users", label: "User Management", Icon: Users2 },
  { href: "/settings", label: "ตั้งค่า", Icon: Settings },
];

const dpoNav: NavItem[] = [
  { href: "/dpo", label: "หน้าแรก", Icon: Home },
  { href: "/dpo/reviews", label: "รอการอนุมัติ", Icon: BadgeCheck },
  { href: "/dpo/records", label: "บันทึกรายการกิจกรรม", Icon: ListChecks },
  { href: "/settings", label: "ตั้งค่า", Icon: Activity },
];

const auditorNav: NavItem[] = [
  { href: "/dpo/records", label: "บันทึกรายการกิจกรรม", Icon: ListChecks },
];

export function getDashboardNav(role?: AppRole): NavItem[] {
  if (role === "ADMIN") return adminNav;
  if (role === "DPO") return dpoNav;
  if (role === "AUDITOR") return auditorNav;
  return dataOwnerNav;
}
