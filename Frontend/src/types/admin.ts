export type AdminUserRole = "ADMIN" | "DPO" | "DATA_OWNER";

export type AdminUserStatus = "active" | "inactive";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  department: string;
  status: AdminUserStatus;
};

export type AdminDashboardData = {
  source: "api" | "mock";
  loadError?: string | null;
  totalUsers: number;
  totalDepartments: number;
  totalRopa: number;
  systemOnline: boolean;
  departmentWorkload: Array<{ department: string; count: number }>;
  latestUsers: Array<Pick<AdminUserRow, "id" | "name" | "role" | "department" | "status">>;
  recentLogs: string[];
};

export type AdminUserManagementData = {
  source: "api" | "mock";
  loadError?: string | null;
  rows: AdminUserRow[];
  filters: {
    q: string;
    role: "all" | AdminUserRole;
    department: string;
  };
  departments: string[];
};
