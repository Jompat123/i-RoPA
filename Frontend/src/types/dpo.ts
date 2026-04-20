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

export type DpoRecordRow = {
  id: string;
  processName: string;
  department: string;
  purpose: string;
  dataType: string;
  legalBasis: string;
  retentionPeriod: string;
  security: string;
};

export type DpoRecordsData = {
  source: "api" | "mock";
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
