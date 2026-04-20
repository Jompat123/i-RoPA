export type ItemStatus = "draft" | "approved" | "pending" | "needs_fix";

export type MyItemRecord = {
  id: string;
  code: string;
  activityName: string;
  updatedAtLabel: string;
  departmentName: string;
  status: ItemStatus;
};

export type MyItemsStats = {
  total: number;
  draft: number;
  pending: number;
  needsFix: number;
  approved: number;
};

export type MyItemsPageData = {
  source: "api" | "mock";
  rows: MyItemRecord[];
  stats: MyItemsStats;
  departments: string[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filters: {
    q: string;
    status: "all" | ItemStatus;
    department: string;
  };
};

export type DestructionStatus = "near_expiry" | "expired" | "destroyed";

export type DestructionRow = {
  id: string;
  activityName: string;
  departmentName: string;
  dueDateLabel: string;
  /** YYYY-MM-DD สำหรับกรองช่วงวันที่ */
  dueDateIso: string;
  status: DestructionStatus;
  proofUrl: string | null;
  proofLabel: string;
};

export type DestructionPageData = {
  source: "api" | "mock";
  rows: DestructionRow[];
  departments: string[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  filters: {
    q: string;
    status: "all" | DestructionStatus;
    department: string;
    startDate: string;
    endDate: string;
  };
};
