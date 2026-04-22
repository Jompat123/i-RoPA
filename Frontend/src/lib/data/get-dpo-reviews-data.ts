import { apiPathRopaItem, apiPathRopaList } from "@/config/api-endpoints";
import { getMockRopaById, listMockRopa } from "@/lib/data/mock-ropa-store";
import type {
  DpoReviewDetailData,
  DpoReviewQueueData,
  DpoReviewRow,
  DpoReviewStatus,
} from "@/types/dpo";
import { getLiveApiSession } from "@/lib/data/api-session";
import { shouldUseMockData } from "./runtime";

type Query = Record<string, string | string[] | undefined>;
type ApiRopa = {
  id: string;
  role?: string | null;
  referenceCode?: string | null;
  processName?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  department?: { name?: string | null } | null;
  createdBy?: { name?: string | null; role?: string | null; roleLabel?: string | null } | null;
  purpose?: string | null;
  legalBasis?: string | null;
  legalExemption28?: string | null;
  retentionPeriod?: string | null;
  transferCountry?: string | null;
  dataSource?: string | null;
  dataControllerAddress?: string | null;
  dataCategory?: string | null;
  dataType?: string | null;
  personalDataTypes?: string[] | string | null;
  collectionMethod?: string | null;
  collectionSource?: string | null;
  collectionMethodType?: string | null;
  crossBorderTransfer?: boolean | null;
  transferToAffiliate?: boolean | null;
  transferAffiliateName?: string | null;
  transferMethod?: string | null;
  protectionStandard?: string | null;
  storageDataType?: string | null;
  storageMethod?: string | null;
  rightsAccessNote?: string | null;
  rightsRefusalNote?: string | null;
  disclosureNote?: string | null;
  minorConsentUnder10?: boolean | null;
  minorConsent10to20?: boolean | null;
  minorConsentOtherNote?: string | null;
  deletionMethod?: string | null;
  securityTech?: string | null;
  securityPhysical?: string | null;
  securityOrg?: string | null;
  securityAccessControl?: string | null;
  securityUserResponsibility?: string | null;
  securityAudit?: string | null;
};

function getParam(q: Query, key: string): string {
  const v = q[key];
  const x = Array.isArray(v) ? v[0] : v;
  return (x ?? "").trim();
}

function mapStatus(status: string): DpoReviewStatus {
  const s = status.toUpperCase();
  if (s === "COMPLETE" || s === "APPROVED") return "approved";
  if (s === "REJECTED" || s === "NEEDS_FIX") return "needs_fix";
  if (s === "PENDING" || s === "SUBMITTED" || s === "IN_REVIEW") return "pending";
  return "pending";
}

function asText(value: unknown, fallback = "-"): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
}

function thaiDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear() + 543}`;
}

function toValue(value: unknown): string {
  if (Array.isArray(value)) {
    const items = value.map((x) => String(x).trim()).filter(Boolean);
    return items.length ? items.join(", ") : "-";
  }
  if (typeof value === "boolean") return value ? "มี" : "ไม่มี";
  if (typeof value === "string") return value.trim() || "-";
  if (typeof value === "number") return String(value);
  return "-";
}

function toDataTypeLabel(value: unknown): string {
  const raw = toValue(value).toUpperCase();
  if (raw === "SENSITIVE") return "ข้อมูลอ่อนไหว";
  if (raw === "GENERAL") return "ข้อมูลทั่วไป";
  return toValue(value);
}

function ropaEntryRoleLabel(value: unknown): string {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  if (s === "processor") return "ผู้ประมวลผล (Processor)";
  if (s === "controller") return "ผู้ควบคุม (Controller)";
  return s ? s : "-";
}

function dataCategoryTh(value: unknown): string {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  if (s === "customer") return "ลูกค้า (customer)";
  if (s === "employee") return "พนักงาน (employee)";
  if (s === "partner") return "คู่ค้า (partner)";
  if (s === "contact") return "ผู้ติดต่อ (contact)";
  return toValue(value);
}

function collectionMethodParts(row: ApiRopa): { source: string; method: string; raw: string } {
  const fromApiSource = String(row.collectionSource || "").toLowerCase();
  const fromApiType = String(row.collectionMethodType || "").toLowerCase();
  const raw = String(row.collectionMethod || "").trim();
  const parts = raw
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
  const sourceToken = parts.find((x) => x === "DIRECT" || x === "OTHER");
  const methodToken = parts.find((x) => x === "SOFT" || x === "HARD");

  let sourceLabel: string;
  if (fromApiSource === "direct" || (!fromApiSource && (sourceToken === "DIRECT" || !sourceToken)))
    sourceLabel = "จากเจ้าของข้อมูลส่วนบุคคลโดยตรง";
  else if (fromApiSource === "other" || sourceToken === "OTHER") sourceLabel = "จากแหล่งอื่น";
  else sourceLabel = raw ? "ไม่สามารถอ่านแหล่งที่มาได้" : "-";

  let methodLabel: string;
  if (fromApiType === "soft") methodLabel = "soft file";
  else if (fromApiType === "hard") methodLabel = "hard copy";
  else if (methodToken === "SOFT") methodLabel = "soft file";
  else if (methodToken === "HARD") methodLabel = "hard copy";
  else methodLabel = "-";

  return { source: sourceLabel, method: methodLabel, raw: raw || "-" };
}

function minorConsentSummary(row: ApiRopa): string {
  const a = row.minorConsentUnder10 === true;
  const b = row.minorConsent10to20 === true;
  const other = (row.minorConsentOtherNote || "").trim();
  if (!a && !b && !other) return "ไม่ใช่กรณีขอความยินยอมผู้เยาว์ / ไม่ระบุ";
  const bits: string[] = [];
  if (a) bits.push("อายุไม่เกิน 10 ปี");
  if (b) bits.push("อายุ 10–20 ปี");
  if (other) bits.push(`อื่น ๆ: ${other}`);
  return bits.length ? bits.join(" · ") : "-";
}

function buildStepForms(row: ApiRopa): DpoReviewDetailData["stepForms"] {
  const isProcessor = String(row.role || "")
    .trim()
    .toLowerCase() === "processor";
  const coll = collectionMethodParts(row);
  return [
    {
      id: "step1",
      label: "ขั้นตอนที่ 1: ข้อมูลกิจกรรม",
      fields: [
        { label: "บทบาท (Controller / Processor)", value: ropaEntryRoleLabel(row.role) },
        { label: "ชื่อหน่วยงาน/องค์กร (Controller หรือ Processor)", value: toValue(row.dataSource) },
        ...(isProcessor
          ? [
              {
                label: "ข้อมูลและที่อยู่ของผู้ควบคุมข้อมูลส่วนบุคคล",
                value: toValue(row.dataControllerAddress),
              },
            ]
          : []),
        { label: "กิจกรรมประมวลผล", value: toValue(row.processName) },
        { label: "วัตถุประสงค์การประมวลผล", value: toValue(row.purpose) },
      ],
    },
    {
      id: "step2",
      label: "ขั้นตอนที่ 2: ข้อมูลที่จัดเก็บ",
      fields: [
        { label: "ข้อมูลส่วนบุคคลที่จัดเก็บ", value: toValue(row.personalDataTypes) },
        { label: "หมวดหมู่ข้อมูล", value: dataCategoryTh(row.dataCategory) },
        { label: "ประเภทข้อมูล", value: toDataTypeLabel(row.dataType) },
        { label: "วิธีการได้มา (soft file / hard copy)", value: coll.method },
        { label: "แหล่งที่มาข้อมูล", value: coll.source },
        { label: "ค่า collection ดิบ (อ้างอิง/ตรวจสอบ)", value: coll.raw },
        { label: "การขอความยินยอมของผู้เยาว์ (Controller)", value: minorConsentSummary(row) },
      ],
    },
    {
      id: "step3",
      label: "ขั้นตอนที่ 3: ฐานทางกฎหมายและโอนระหว่างประเทศ",
      fields: [
        { label: "ฐานทางกฎหมายในการประมวลผล", value: toValue(row.legalBasis) },
        { label: "ข้อยกเว้น/คำอธิบายอ้างอิง ม.28 (legalExemption28)", value: toValue(row.legalExemption28) },
        { label: "การใช้หรือเปิดเผยข้อมูล (Disclosure / หมายเหตุ)", value: toValue(row.disclosureNote) },
        { label: "มีการโอนหรือส่งข้อมูลไปยังต่างประเทศ", value: toValue(row.crossBorderTransfer) },
        { label: "ประเทศปลายทาง", value: toValue(row.transferCountry) },
        { label: "โอนไปยังกลุ่มบริษัทในเครือ", value: toValue(row.transferToAffiliate) },
        { label: "ชื่อ/รายละเอียดกลุ่มเครือ หรือนิติบุคคลปลายทาง", value: toValue(row.transferAffiliateName) },
        { label: "วิธีการโอน (Transfer method)", value: toValue(row.transferMethod) },
        { label: "มาตรฐานการคุ้มครองข้อมูล ณ ปลายทาง", value: toValue(row.protectionStandard) },
      ],
    },
    {
      id: "step4",
      label: "ขั้นตอนที่ 4: การจัดเก็บ รักษา สิทธิ และมาตรการรักษาความมั่นคงปลอดภัย",
      fields: [
        { label: "ประเภทการจัดเก็บ (soft / hard)", value: toValue(row.storageDataType) },
        { label: "วิธีการเก็บรักษา", value: toValue(row.storageMethod) },
        { label: "ระยะเวลาจัดเก็บ", value: toValue(row.retentionPeriod) },
        { label: "สิทธิการเข้าถึง / เงื่อนไข (rightsAccessNote)", value: toValue(row.rightsAccessNote) },
        { label: "วิธีการลบหรือทำลายข้อมูล", value: toValue(row.deletionMethod) },
        {
          label: "การปฏิเสธคำขอ/คัดค้านสิทธิเจ้าของข้อมูล (Controller — ข้อ 14)",
          value: isProcessor ? "ไม่เกี่ยวข้อง (Processor)" : toValue(row.rightsRefusalNote),
        },
        { label: "มาตรการ (Technical / securityTech)", value: toValue(row.securityTech) },
        { label: "มาตรการ (Physical / securityPhysical)", value: toValue(row.securityPhysical) },
        { label: "มาตรการ (Organizational / securityOrg)", value: toValue(row.securityOrg) },
        { label: "การควบคุมการเข้าถึง (securityAccessControl)", value: toValue(row.securityAccessControl) },
        {
          label: "หน้าที่ความรับผิดชอบของผู้ใช้ (securityUserResponsibility)",
          value: toValue(row.securityUserResponsibility),
        },
        { label: "มาตรการตรวจสอบ/audit (securityAudit)", value: toValue(row.securityAudit) },
      ],
    },
  ];
}

function normalize(rows: ApiRopa[]): DpoReviewRow[] {
  return rows
    .filter((row) => {
      const role = String(row.createdBy?.role || row.createdBy?.roleLabel || "").toUpperCase();
      if (!role) return true;
      return (
        role.includes("DATA_OWNER") ||
        role.includes("DEPARTMENT_USER") ||
        role.includes("ADMIN")
      );
    })
    .filter((row) => String(row.status || "").toUpperCase() !== "DRAFT")
    .map((row, i) => ({
      id: row.id,
      code:
        row.referenceCode?.trim() ||
        `ROPA-${new Date().getFullYear()}-${String(i + 1).padStart(3, "0")}`,
      processName: asText(row.processName),
      department: row.department?.name || "Unknown",
      submittedAtLabel: thaiDate(row.updatedAt || ""),
      ownerName: row.createdBy?.name || "-",
      status: mapStatus(row.status || ""),
    }));
}

function applyFilters(
  rows: DpoReviewRow[],
  q: string,
  status: "all" | DpoReviewStatus,
  department: string,
) {
  const qq = q.toLowerCase();
  return rows.filter((row) => {
    const byQ =
      !qq ||
      row.code.toLowerCase().includes(qq) ||
      row.processName.toLowerCase().includes(qq) ||
      row.ownerName.toLowerCase().includes(qq);
    const byStatus =
      status === "all"
        ? row.status === "pending" || row.status === "needs_fix"
        : row.status === status;
    const byDep = !department || row.department === department;
    return byQ && byStatus && byDep;
  });
}

async function fetchApiRows(): Promise<DpoReviewRow[] | null> {
  const session = await getLiveApiSession();
  if (!session.ok) return null;
  try {
    const res = await fetch(`${session.base.replace(/\/$/, "")}${apiPathRopaList()}`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiRopa[];
    if (!Array.isArray(json)) return null;
    return normalize(json);
  } catch {
    return null;
  }
}

async function fetchApiDetail(id: string): Promise<DpoReviewDetailData | null> {
  const session = await getLiveApiSession();
  if (!session.ok) return null;

  try {
    const res = await fetch(`${session.base.replace(/\/$/, "")}${apiPathRopaItem(id)}`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;

    const row = (await res.json()) as ApiRopa;
    if (!row || typeof row !== "object" || !row.id) return null;

    return {
      source: "api",
      loadError: null,
      id: row.id,
      code: row.referenceCode?.trim() || `ROPA-${new Date().getFullYear()}-${String(row.id).slice(-6)}`,
      processName: asText(row.processName),
      department: row.department?.name || "Unknown",
      ownerName: row.createdBy?.name || "-",
      status: mapStatus(row.status || ""),
      submittedAtLabel: thaiDate(row.updatedAt || ""),
      summary: {
        purpose: asText(row.purpose),
        legalBasis: asText(row.legalBasis),
        retentionPeriod: asText(row.retentionPeriod),
        transferCountry: asText(row.transferCountry),
      },
      stepForms: buildStepForms(row),
    };
  } catch {
    return null;
  }
}

export async function getDpoReviewsData(searchParams: Query): Promise<DpoReviewQueueData> {
  const q = getParam(searchParams, "q");
  const status = (getParam(searchParams, "status") || "all") as "all" | DpoReviewStatus;
  const department = getParam(searchParams, "department");

  const mockRows = normalize(
    listMockRopa().map((row) => ({
      id: row.id,
      referenceCode: row.referenceCode,
      processName: row.processName,
      status: row.status,
      updatedAt: row.updatedAt,
      department: row.department ?? null,
      createdBy: row.createdBy ?? null,
    })),
  );

  let baseRows: DpoReviewRow[];
  let source: "api" | "mock";
  let loadError: string | null = null;

  if (shouldUseMockData()) {
    baseRows = mockRows;
    source = "mock";
  } else {
    const session = await getLiveApiSession();
    if (!session.ok) {
      baseRows = [];
      source = "api";
      loadError = session.error;
    } else {
      const apiRows = await fetchApiRows();
      if (apiRows) {
        baseRows = apiRows;
        source = "api";
      } else {
        baseRows = [];
        source = "api";
        loadError = "โหลดคิวอนุมัติจากเซิร์ฟเวอร์ไม่สำเร็จ";
      }
    }
  }

  const rows = applyFilters(baseRows, q, status, department);
  const departments = [...new Set(baseRows.map((r) => r.department))].sort((a, b) =>
    a.localeCompare(b, "th"),
  );

  return {
    source,
    loadError,
    rows,
    departments,
    filters: { q, status, department },
  };
}

export async function getDpoReviewDetailData(id: string): Promise<DpoReviewDetailData | null> {
  if (shouldUseMockData()) {
    const mock = getMockRopaById(id);
    if (mock) {
      const mockRole = mock.ropaRole === "processor" ? "processor" : "controller";
      const mapped: ApiRopa = {
        id: mock.id,
        role: mockRole,
        processName: mock.processName,
        status: mock.status,
        updatedAt: mock.updatedAt,
        department: mock.department ?? null,
        createdBy: mock.createdBy ?? null,
        purpose: mock.purpose ?? null,
        legalBasis: mock.legalBasis ?? null,
        legalExemption28: mock.legalExemption28 ?? null,
        retentionPeriod: mock.retentionPeriod ?? null,
        transferCountry: mock.transferCountry ?? null,
        dataSource: mock.dataSource ?? null,
        dataControllerAddress: mock.dataControllerAddress ?? null,
        dataCategory: mock.dataCategory ?? null,
        dataType: mock.dataType ?? null,
        personalDataTypes: mock.personalDataTypes ?? [],
        collectionMethod: mock.collectionMethod ?? null,
        crossBorderTransfer: mock.crossBorderTransfer ?? null,
        transferToAffiliate: mock.transferToAffiliate ?? null,
        transferAffiliateName: mock.transferAffiliateName ?? null,
        transferMethod: mock.transferMethod ?? null,
        protectionStandard: mock.protectionStandard ?? null,
        storageDataType: mock.storageDataType ?? null,
        storageMethod: mock.storageMethod ?? null,
        rightsAccessNote: mock.rightsAccessNote ?? null,
        rightsRefusalNote: mock.rightsRefusalNote ?? null,
        disclosureNote: mock.disclosureNote ?? null,
        minorConsentUnder10: mock.minorConsentUnder10 ?? null,
        minorConsent10to20: mock.minorConsent10to20 ?? null,
        minorConsentOtherNote: mock.minorConsentOtherNote ?? null,
        deletionMethod: mock.deletionMethod ?? null,
        securityTech: mock.securityTech ?? null,
        securityPhysical: mock.securityPhysical ?? null,
        securityOrg: mock.securityOrg ?? null,
        securityAccessControl: mock.securityAccessControl ?? null,
        securityUserResponsibility: mock.securityUserResponsibility ?? null,
        securityAudit: null,
      };
      return {
        source: "mock",
        loadError: null,
        id: mapped.id,
        code: mock.referenceCode || `ROPA-${new Date().getFullYear()}-${String(mapped.id).slice(-6)}`,
        processName: asText(mapped.processName),
        department: mapped.department?.name || "Unknown",
        ownerName: mapped.createdBy?.name || "-",
        status: mapStatus(mapped.status || ""),
        submittedAtLabel: thaiDate(mapped.updatedAt || ""),
        summary: {
          purpose: asText(mapped.purpose),
          legalBasis: asText(mapped.legalBasis),
          retentionPeriod: asText(mapped.retentionPeriod),
          transferCountry: asText(mapped.transferCountry),
        },
        stepForms: buildStepForms(mapped),
      };
    }
  }

  if (!shouldUseMockData()) {
    const api = await fetchApiDetail(id);
    if (api) return api;
  }

  return null;
}
