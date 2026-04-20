export type DpoReviewStatus = "pending" | "approved" | "needs_fix";

export type DpoDepartmentStatus = {
  department: string;
  approved: number;
  pending: number;
  needsFix: number;
};

export type DpoLegalBasisSlice = {
  key: string;
  label: string;
  count: number;
};

export type DpoReviewRow = {
  id: string;
  code: string;
  processName: string;
  department: string;
  submittedAtLabel: string;
  ownerName: string;
  status: DpoReviewStatus;
};

export type DpoDashboardData = {
  source: "api" | "mock";
  loadError?: string | null;
  summary: {
    pending: number;
    approved: number;
    needsFix: number;
  };
  workflow: {
    newPending: number;
    updatePending: number;
    revisionRequired: number;
    alertCount: number;
  };
  departmentStatus: DpoDepartmentStatus[];
  legalBasisDistribution: DpoLegalBasisSlice[];
  latestQueue: DpoReviewRow[];
  recentLogs: string[];
};

export type DpoReviewQueueData = {
  source: "api" | "mock";
  loadError?: string | null;
  rows: DpoReviewRow[];
  departments: string[];
  filters: {
    q: string;
    status: "all" | DpoReviewStatus;
    department: string;
  };
};

export type DpoReviewDetailData = {
  source: "api" | "mock";
  id: string;
  code: string;
  processName: string;
  department: string;
  ownerName: string;
  status: DpoReviewStatus;
  submittedAtLabel: string;
  summary: {
    purpose: string;
    legalBasis: string;
    retentionPeriod: string;
    transferCountry: string;
  };
  stepForms: Array<{
    id: "step1" | "step2" | "step3" | "step4";
    label: string;
    fields: Array<{ label: string; value: string }>;
  }>;
};

/** บทบาทตามขั้นตอนที่ 1 ของแบบ RoPA (ผู้ควบคุม vs ผู้ประมวลผล) */
export type RopaEntityRole = "controller" | "processor";

export type DpoRecordRow = {
  id: string;
  role: RopaEntityRole;
  processName: string;
  department: string;
  purpose: string;
  dataType: string;
  legalBasis: string;
  retentionPeriod: string;
  /** ข้อ 14 — มีค่าเมื่อ role เป็น controller */
  rightsRefusalNote: string | null;
  /** ข้อ 15 — สรุปมาตรการ (controller); processor ใช้ null แล้วแสดงข้อความ N/A ใน UI */
  securityMeasuresSummary: string | null;
};

export type DpoRecordsData = {
  source: "api" | "mock";
  loadError?: string | null;
  rows: DpoRecordRow[];
  filters: {
    department: string;
    dataType: string;
    legalBasis: string;
  };
  departments: string[];
  dataTypes: string[];
  legalBases: string[];
};
