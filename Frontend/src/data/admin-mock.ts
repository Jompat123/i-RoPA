import type { AdminDashboardData, AdminUserManagementData } from "@/types/admin";

const rows = [
  {
    id: "u-1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "ADMIN",
    department: "IT",
    status: "active",
  },
  {
    id: "u-2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "DPO",
    department: "Legal",
    status: "active",
  },
  {
    id: "u-3",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    role: "DATA_OWNER",
    department: "Finance",
    status: "active",
  },
  {
    id: "u-4",
    name: "Emily Davis",
    email: "emily.davis@company.com",
    role: "DATA_OWNER",
    department: "HR",
    status: "inactive",
  },
  {
    id: "u-5",
    name: "Chris Wilson",
    email: "chris.wilson@company.com",
    role: "ADMIN",
    department: "Operations",
    status: "active",
  },
] as const;

export const adminUserManagementMock: AdminUserManagementData = {
  source: "mock",
  rows: [...rows],
  filters: { q: "", role: "all", department: "" },
  departments: ["Finance", "HR", "IT", "Legal", "Operations"],
};

export const adminDashboardMock: AdminDashboardData = {
  source: "mock",
  totalUsers: 320,
  totalDepartments: 45,
  totalRopa: 1250,
  systemOnline: true,
  departmentWorkload: [
    { department: "HR", count: 38 },
    { department: "Marketing", count: 24 },
    { department: "IT", count: 19 },
    { department: "Procurement", count: 26 },
  ],
  latestUsers: rows.slice(0, 3).map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    department: r.department,
    status: r.status,
  })),
  recentLogs: [
    "User John Doe updated Department settings - 2 mins ago",
    "User Jane Smith updated Department settings - 3 mins ago",
    "User John Brown updated Department settings - 4 mins ago",
    "User Emily Davis updated Department settings - 5 mins ago",
  ],
};
