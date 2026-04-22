/**
 * Mock persistence เมื่อ `USE_MOCK_DATA` — เก็บในหน่วยความจำของโปรเซส Node
 * รีสตาร์ท dev server แล้วข้อมูลจะกลับไปชุด seed เริ่มต้น
 */
export type MockRopaEntry = {
  id: string;
  referenceCode: string;
  processName: string;
  purpose: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  department?: { name?: string | null } | null;
  createdBy?: { name?: string | null; role?: string | null; roleLabel?: string | null } | null;
  legalBasis?: string | null;
  retentionPeriod?: string | null;
  transferCountry?: string | null;
  dataSource?: string | null;
  dataControllerAddress?: string | null;
  dataCategory?: string | null;
  dataType?: string | null;
  personalDataTypes?: string[] | string | null;
  collectionMethod?: string | null;
  crossBorderTransfer?: boolean | null;
  transferMethod?: string | null;
  protectionStandard?: string | null;
  storageMethod?: string | null;
  deletionMethod?: string | null;
  securityTech?: string | null;
  securityPhysical?: string | null;
  securityOrg?: string | null;
  reviewNote?: string | null;
  reviewChecks?: unknown[];
  /** ผู้ควบคุม vs ผู้ประมวลผล (ขั้นตอนที่ 1) */
  ropaRole?: "controller" | "processor" | null;
  /** ข้อ 14 — มีเมื่อเป็น controller */
  rightsRefusalNote?: string | null;
  destructionConfirmedAt?: string | null;
  destructionProofUrl?: string | null;
  destructionNote?: string | null;
};

type StoreState = { rows: MockRopaEntry[] };

const STORE_KEY = "__iropa_mock_ropa_store__";

function seedRows(): MockRopaEntry[] {
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  return [
    {
      id: "mock-1",
      referenceCode: "ROPA-2026-001",
      processName: "การประมวลผลข้อมูลลูกค้า",
      purpose: "เพื่อบริหารความสัมพันธ์ลูกค้าและทำการตลาด",
      status: "PENDING",
      createdAt: new Date(now.getTime() - 8 * day).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * day).toISOString(),
      department: { name: "Marketing" },
      createdBy: { name: "Data Owner Marketing", role: "DEPARTMENT_USER", roleLabel: "Data Owner" },
      legalBasis: "contract,legitimate_interest",
      retentionPeriod: "5 ปี",
      transferCountry: "Singapore",
      dataSource: "บริษัทตัวอย่าง จำกัด",
      dataCategory: "customer",
      dataType: "GENERAL",
      personalDataTypes: ["ชื่อ", "อีเมล", "เบอร์โทร"],
      collectionMethod: "DIRECT",
      crossBorderTransfer: true,
      transferMethod: "Secure API",
      protectionStandard: "SCC",
      storageMethod: "Cloud (encrypted)",
      deletionMethod: "ลบถาวรจากระบบ",
      securityTech: "Encryption + MFA",
      securityPhysical: "Access control",
      securityOrg: "Role-based policy",
      reviewNote: null,
      reviewChecks: [],
      ropaRole: "controller",
      rightsRefusalNote: "ยังไม่มีเคสปฏิเสธคำขอ (บันทึกตามนโยบายองค์กร)",
      destructionConfirmedAt: null,
      destructionProofUrl: null,
      destructionNote: null,
    },
    {
      id: "mock-2",
      referenceCode: "ROPA-2026-002",
      processName: "การจัดการข้อมูลพนักงาน",
      purpose: "เพื่อบริหารทรัพยากรบุคคล",
      status: "NEEDS_FIX",
      createdAt: new Date(now.getTime() - 12 * day).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * day).toISOString(),
      department: { name: "HR" },
      createdBy: { name: "Data Owner HR", role: "DEPARTMENT_USER", roleLabel: "Data Owner" },
      legalBasis: "legal_obligation,contract",
      retentionPeriod: "10 ปี",
      transferCountry: "",
      dataSource: "ฝ่ายบุคคล",
      dataControllerAddress: "บริษัทตัวอย่าง จำกัด, 123 ถนนสุขุมวิท กรุงเทพฯ 10110",
      dataCategory: "employee",
      dataType: "SENSITIVE",
      personalDataTypes: ["ชื่อ", "ที่อยู่", "ข้อมูลสุขภาพ"],
      collectionMethod: "DIRECT",
      crossBorderTransfer: false,
      transferMethod: "",
      protectionStandard: "",
      storageMethod: "On-premise server",
      deletionMethod: "ทำลายเอกสารและ wipe disk",
      securityTech: "Audit trail",
      securityPhysical: "Restricted room",
      securityOrg: "DPO review",
      reviewNote: "กรุณาเพิ่มรายละเอียด transfer method และมาตรฐานคุ้มครอง",
      reviewChecks: [],
      ropaRole: "processor",
      rightsRefusalNote: null,
      destructionConfirmedAt: null,
      destructionProofUrl: null,
      destructionNote: null,
    },
    {
      id: "mock-3",
      referenceCode: "ROPA-2026-003",
      processName: "การจัดเก็บเอกสารทางบัญชี",
      purpose: "เพื่อการตรวจสอบทางบัญชี",
      status: "COMPLETE",
      createdAt: new Date(now.getTime() - 16 * day).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * day).toISOString(),
      department: { name: "Finance" },
      createdBy: { name: "Data Owner Finance", role: "DEPARTMENT_USER", roleLabel: "Data Owner" },
      legalBasis: "legal_obligation",
      retentionPeriod: "10 ปี",
      transferCountry: "",
      dataSource: "ฝ่ายการเงิน",
      dataCategory: "customer",
      dataType: "GENERAL",
      personalDataTypes: ["ชื่อ", "เลขผู้เสียภาษี"],
      collectionMethod: "DIRECT",
      crossBorderTransfer: false,
      transferMethod: "",
      protectionStandard: "",
      storageMethod: "ตู้เอกสารล็อกกุญแจ",
      deletionMethod: "เครื่องทำลายเอกสาร",
      securityTech: "Access logs",
      securityPhysical: "Locked cabinet",
      securityOrg: "Retention policy",
      reviewNote: null,
      reviewChecks: [],
      ropaRole: "controller",
      rightsRefusalNote: "",
      destructionConfirmedAt: null,
      destructionProofUrl: null,
      destructionNote: null,
    },
  ];
}

function getStore(): StoreState {
  const globalRef = globalThis as typeof globalThis & { [STORE_KEY]?: StoreState };
  if (!globalRef[STORE_KEY]) {
    globalRef[STORE_KEY] = { rows: seedRows() };
  }
  return globalRef[STORE_KEY]!;
}

export function listMockRopa(): MockRopaEntry[] {
  return [...getStore().rows];
}

export function getMockRopaById(id: string): MockRopaEntry | null {
  return getStore().rows.find((row) => row.id === id) ?? null;
}

export function createMockRopa(payload: Partial<MockRopaEntry>): MockRopaEntry {
  const store = getStore();
  const now = new Date().toISOString();
  const running = store.rows.length + 1;
  const row: MockRopaEntry = {
    id: payload.id || crypto.randomUUID(),
    referenceCode: payload.referenceCode || `ROPA-${new Date().getFullYear()}-${String(running).padStart(3, "0")}`,
    processName: payload.processName || "แบบฟอร์มที่ยังไม่ระบุชื่อกิจกรรม",
    purpose: payload.purpose ?? null,
    status: payload.status || "DRAFT",
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
    department: payload.department ?? { name: "Unknown" },
    createdBy: payload.createdBy ?? { name: "Data Owner", role: "DEPARTMENT_USER", roleLabel: "Data Owner" },
    legalBasis: payload.legalBasis ?? null,
    retentionPeriod: payload.retentionPeriod ?? null,
    transferCountry: payload.transferCountry ?? null,
    dataSource: payload.dataSource ?? null,
    dataControllerAddress: payload.dataControllerAddress ?? null,
    dataCategory: payload.dataCategory ?? null,
    dataType: payload.dataType ?? null,
    personalDataTypes: payload.personalDataTypes ?? [],
    collectionMethod: payload.collectionMethod ?? null,
    crossBorderTransfer: payload.crossBorderTransfer ?? false,
    transferMethod: payload.transferMethod ?? null,
    protectionStandard: payload.protectionStandard ?? null,
    storageMethod: payload.storageMethod ?? null,
    deletionMethod: payload.deletionMethod ?? null,
    securityTech: payload.securityTech ?? null,
    securityPhysical: payload.securityPhysical ?? null,
    securityOrg: payload.securityOrg ?? null,
    reviewNote: payload.reviewNote ?? null,
    reviewChecks: payload.reviewChecks ?? [],
    ropaRole: payload.ropaRole ?? "controller",
    rightsRefusalNote: payload.rightsRefusalNote ?? null,
    destructionConfirmedAt: payload.destructionConfirmedAt ?? null,
    destructionProofUrl: payload.destructionProofUrl ?? null,
    destructionNote: payload.destructionNote ?? null,
  };
  store.rows.unshift(row);
  return row;
}

export function updateMockRopa(id: string, patch: Partial<MockRopaEntry>): MockRopaEntry | null {
  const store = getStore();
  const idx = store.rows.findIndex((row) => row.id === id);
  if (idx < 0) return null;
  const next = {
    ...store.rows[idx],
    ...patch,
    id,
    updatedAt: patch.updatedAt || new Date().toISOString(),
  };
  store.rows[idx] = next;
  return next;
}
