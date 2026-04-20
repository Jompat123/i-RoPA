import type {
  DpoDashboardData,
  DpoRecordRow,
  DpoReviewDetailData,
  DpoReviewQueueData,
  DpoReviewRow,
  DpoRecordsData,
  RopaEntityRole,
} from "@/types/dpo";

export const dpoMockRows: DpoReviewRow[] = [
  {
    id: "r-1",
    code: "ROPA-2023-001",
    processName: "การประมวลผลข้อมูลลูกค้า",
    department: "Marketing",
    submittedAtLabel: "10/11/2566",
    ownerName: "John Doe",
    status: "pending",
  },
  {
    id: "r-2",
    code: "ROPA-2023-002",
    processName: "การจัดการข้อมูลพนักงาน",
    department: "HR",
    submittedAtLabel: "08/11/2566",
    ownerName: "Jane Smith",
    status: "approved",
  },
  {
    id: "r-3",
    code: "ROPA-2023-003",
    processName: "การเก็บข้อมูลผู้ติดต่อ",
    department: "Operations",
    submittedAtLabel: "05/11/2566",
    ownerName: "Michael Brown",
    status: "needs_fix",
  },
  {
    id: "r-4",
    code: "ROPA-2023-004",
    processName: "การประเมินพนักงาน",
    department: "HR",
    submittedAtLabel: "02/11/2566",
    ownerName: "Emily Davis",
    status: "pending",
  },
];

export const dpoDashboardMock: DpoDashboardData = {
  source: "mock",
  summary: {
    pending: dpoMockRows.filter((r) => r.status === "pending").length,
    approved: dpoMockRows.filter((r) => r.status === "approved").length,
    needsFix: dpoMockRows.filter((r) => r.status === "needs_fix").length,
  },
  workflow: {
    newPending: 2,
    updatePending: 1,
    revisionRequired: dpoMockRows.filter((r) => r.status === "needs_fix").length,
    alertCount: dpoMockRows.length,
  },
  departmentStatus: [
    {
      department: "HR",
      approved: 1,
      pending: 1,
      needsFix: 0,
    },
    {
      department: "Marketing",
      approved: 0,
      pending: 1,
      needsFix: 0,
    },
    {
      department: "Operations",
      approved: 0,
      pending: 0,
      needsFix: 1,
    },
    {
      department: "Finance",
      approved: 1,
      pending: 0,
      needsFix: 1,
    },
  ],
  legalBasisDistribution: [
    { key: "consent", label: "Consent", count: 4 },
    { key: "contract", label: "Contract", count: 5 },
    { key: "legitimate_interest", label: "Legitimate Interest", count: 3 },
    { key: "legal_obligation", label: "Legal Obligation", count: 2 },
  ],
  latestQueue: dpoMockRows.slice(0, 4),
  recentLogs: [
    "DPO reviewed ROPA-2023-001 - 2 mins ago",
    "DPO approved ROPA-2023-002 - 5 mins ago",
    "DPO returned ROPA-2023-003 - 7 mins ago",
  ],
};

export const dpoQueueMock: DpoReviewQueueData = {
  source: "mock",
  rows: dpoMockRows,
  departments: [...new Set(dpoMockRows.map((r) => r.department))].sort((a, b) =>
    a.localeCompare(b, "th"),
  ),
  filters: {
    q: "",
    status: "all",
    department: "",
  },
};

export const dpoReviewDetailMock: DpoReviewDetailData = {
  source: "mock",
  id: "r-1",
  code: "ROPA-2023-001",
  processName: "การประมวลผลข้อมูลลูกค้า",
  department: "Marketing",
  ownerName: "John Doe",
  status: "pending",
  submittedAtLabel: "10/11/2566",
  summary: {
    purpose: "เพื่อบริหารความสัมพันธ์ลูกค้าและทำการตลาด",
    legalBasis: "Contract, Legitimate Interest",
    retentionPeriod: "5 ปี",
    transferCountry: "Singapore",
  },
  stepForms: [
    {
      id: "step1",
      label: "ขั้นตอนที่ 1: ข้อมูลกิจกรรม",
      fields: [
        { label: "บทบาท", value: "Controller" },
        { label: "ข้อมูลผู้ควบคุม/ผู้ประมวลผล", value: "บริษัทตัวอย่าง จำกัด" },
        { label: "กิจกรรมประมวลผล", value: "การประมวลผลข้อมูลลูกค้า" },
        { label: "วัตถุประสงค์", value: "เพื่อบริหารความสัมพันธ์ลูกค้าและทำการตลาด" },
      ],
    },
    {
      id: "step2",
      label: "ขั้นตอนที่ 2: ข้อมูลที่จัดเก็บ",
      fields: [
        { label: "ข้อมูลส่วนบุคคลที่จัดเก็บ", value: "ชื่อ, เบอร์โทร, อีเมล" },
        { label: "หมวดหมู่ข้อมูล", value: "ลูกค้า" },
        { label: "ประเภทข้อมูล", value: "ข้อมูลทั่วไป" },
      ],
    },
    {
      id: "step3",
      label: "ขั้นตอนที่ 3: ฐานทางกฎหมาย",
      fields: [
        { label: "ฐานทางกฎหมาย", value: "Contract, Legitimate Interest" },
        { label: "การโอนข้อมูลข้ามประเทศ", value: "Singapore" },
      ],
    },
    {
      id: "step4",
      label: "ขั้นตอนที่ 4: การจัดเก็บและทำลาย",
      fields: [
        { label: "วิธีการเก็บรักษา", value: "เก็บในระบบ Cloud ที่เข้ารหัส" },
        { label: "ระยะเวลาจัดเก็บ", value: "5 ปี" },
        { label: "วิธีการลบข้อมูล", value: "ลบถาวรจากระบบและสำรองข้อมูล" },
      ],
    },
  ],
};

const mockRecord = (
  id: string,
  role: RopaEntityRole,
  processName: string,
  department: string,
  purpose: string,
  dataType: string,
  legalBasis: string,
  retentionPeriod: string,
  rights: string | null,
  security: string | null,
): DpoRecordRow => ({
  id,
  role,
  processName,
  department,
  purpose,
  dataType,
  legalBasis,
  retentionPeriod,
  rightsRefusalNote: rights,
  securityMeasuresSummary: security,
});

export const dpoRecordsMockRows: DpoRecordRow[] = [
  mockRecord(
    "1",
    "controller",
    "ออกใบกำกับภาษีอิเล็กทรอนิกส์ (e-Tax)",
    "บัญชี/ลูกค้า",
    "เพื่อทำบัญชีส่งภาษี",
    "ชื่อ, ที่อยู่, เลขภาษี",
    "หน้าที่ตามกฎหมาย",
    "10 ปี",
    "ยังไม่มีเคสปฏิเสธ",
    "เข้ารหัสข้อมูล | จำกัดสิทธิ์การเข้าถึง",
  ),
  mockRecord(
    "2",
    "processor",
    "จัดส่งพัสดุลูกค้า (e-Waybill)",
    "ขนส่ง/ลูกค้า",
    "เพื่อส่งมอบสินค้า",
    "ชื่อ, ที่อยู่, เบอร์โทร",
    "ฐานสัญญา",
    "5 ปี",
    null,
    null,
  ),
  mockRecord(
    "4",
    "controller",
    "รับสมัครพนักงานใหม่",
    "HR/ผู้สมัคร",
    "เพื่อคัดเลือกบุคลากร",
    "ชื่อ, ประวัติ, ข้อมูลอ่อนไหว",
    "ฐานสัญญา/ความยินยอม",
    "3 ปี",
    "",
    "จำกัดสิทธิ์การเข้าถึง | Audit log",
  ),
];

export const dpoRecordsMock: DpoRecordsData = {
  source: "mock",
  rows: dpoRecordsMockRows,
  filters: {
    department: "",
    dataType: "",
    legalBasis: "",
  },
  departments: [...new Set(dpoRecordsMockRows.map((r) => r.department))],
  dataTypes: ["Data Type", "General", "Sensitive"],
  legalBases: ["Lawful Basis", "Contract", "Consent", "Legal Obligation"],
};
