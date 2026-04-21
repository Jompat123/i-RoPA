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
  referenceCode?: string | null;
  processName?: string | null;
  status?: string | null;
  updatedAt?: string | null;
  department?: { name?: string | null } | null;
  createdBy?: { name?: string | null; role?: string | null; roleLabel?: string | null } | null;
  purpose?: string | null;
  legalBasis?: string | null;
  retentionPeriod?: string | null;
  transferCountry?: string | null;
  dataSource?: string | null;
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

function buildStepForms(row: ApiRopa): DpoReviewDetailData["stepForms"] {
  return [
    {
      id: "step1",
      label: "ขั้นตอนที่ 1: ข้อมูลกิจกรรม",
      fields: [
        { label: "ข้อมูลผู้ควบคุม/ผู้ประมวลผล", value: toValue(row.dataSource) },
        { label: "กิจกรรมประมวลผล", value: toValue(row.processName) },
        { label: "วัตถุประสงค์การประมวลผล", value: toValue(row.purpose) },
      ],
    },
    {
      id: "step2",
      label: "ขั้นตอนที่ 2: ข้อมูลที่จัดเก็บ",
      fields: [
        { label: "ข้อมูลส่วนบุคคลที่จัดเก็บ", value: toValue(row.personalDataTypes) },
        { label: "หมวดหมู่ข้อมูล", value: toValue(row.dataCategory) },
        { label: "ประเภทข้อมูล", value: toDataTypeLabel(row.dataType) },
        { label: "แหล่งที่มาข้อมูล", value: toValue(row.collectionMethod) },
      ],
    },
    {
      id: "step3",
      label: "ขั้นตอนที่ 3: ฐานทางกฎหมาย",
      fields: [
        { label: "ฐานทางกฎหมาย", value: toValue(row.legalBasis) },
        { label: "มีการโอนข้อมูลข้ามประเทศ", value: toValue(row.crossBorderTransfer) },
        { label: "ประเทศปลายทาง", value: toValue(row.transferCountry) },
        { label: "วิธีการโอนข้อมูล", value: toValue(row.transferMethod) },
        { label: "มาตรฐานการคุ้มครอง", value: toValue(row.protectionStandard) },
      ],
    },
    {
      id: "step4",
      label: "ขั้นตอนที่ 4: การจัดเก็บ รักษา และทำลาย",
      fields: [
        { label: "วิธีการเก็บรักษา", value: toValue(row.storageMethod) },
        { label: "ระยะเวลาจัดเก็บ", value: toValue(row.retentionPeriod) },
        { label: "วิธีการลบหรือทำลายข้อมูล", value: toValue(row.deletionMethod) },
        { label: "มาตรการความปลอดภัย (Technical)", value: toValue(row.securityTech) },
        { label: "มาตรการความปลอดภัย (Physical)", value: toValue(row.securityPhysical) },
        { label: "มาตรการความปลอดภัย (Organizational)", value: toValue(row.securityOrg) },
      ],
    },
  ];
}

function normalize(rows: ApiRopa[]): DpoReviewRow[] {
  return rows
    .filter((row) => {
      const role = String(row.createdBy?.role || row.createdBy?.roleLabel || "").toUpperCase();
      if (!role) return true;
      return role.includes("DATA_OWNER") || role.includes("DEPARTMENT_USER");
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
      const mapped: ApiRopa = {
        id: mock.id,
        processName: mock.processName,
        status: mock.status,
        updatedAt: mock.updatedAt,
        department: mock.department ?? null,
        createdBy: mock.createdBy ?? null,
        purpose: mock.purpose ?? null,
        legalBasis: mock.legalBasis ?? null,
        retentionPeriod: mock.retentionPeriod ?? null,
        transferCountry: mock.transferCountry ?? null,
        dataSource: mock.dataSource ?? null,
        dataCategory: mock.dataCategory ?? null,
        dataType: mock.dataType ?? null,
        personalDataTypes: mock.personalDataTypes ?? [],
        collectionMethod: mock.collectionMethod ?? null,
        crossBorderTransfer: mock.crossBorderTransfer ?? null,
        transferMethod: mock.transferMethod ?? null,
        protectionStandard: mock.protectionStandard ?? null,
        storageMethod: mock.storageMethod ?? null,
        deletionMethod: mock.deletionMethod ?? null,
        securityTech: mock.securityTech ?? null,
        securityPhysical: mock.securityPhysical ?? null,
        securityOrg: mock.securityOrg ?? null,
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

  const queue = await getDpoReviewsData({});
  const row = queue.rows.find((r) => r.id === id);
  if (!row) return null;

  return {
    source: queue.source,
    loadError:
      queue.source === "api"
        ? "โหลดรายละเอียดจาก API ไม่สำเร็จ — แสดงข้อมูลสรุปเท่าที่มี"
        : null,
    id: row.id,
    code: row.code,
    processName: row.processName,
    department: row.department,
    ownerName: row.ownerName,
    status: row.status,
    submittedAtLabel: row.submittedAtLabel,
    summary: {
      purpose: "รอข้อมูลจริงจาก backend field purpose",
      legalBasis: "รอข้อมูลจริงจาก backend field legalBasis",
      retentionPeriod: "รอข้อมูลจริงจาก backend field retentionPeriod",
      transferCountry: "รอข้อมูลจริงจาก backend field transferCountry",
    },
    stepForms: [
      {
        id: "step1" as const,
        label: "ขั้นตอนที่ 1: ข้อมูลกิจกรรม",
        fields: [
          { label: "กิจกรรมประมวลผล", value: row.processName },
          { label: "ผู้ส่งคำขอ", value: row.ownerName },
        ],
      },
      {
        id: "step2" as const,
        label: "ขั้นตอนที่ 2: ข้อมูลที่จัดเก็บ",
        fields: [{ label: "ข้อมูลส่วนบุคคลที่จัดเก็บ", value: "รอข้อมูลจริงจาก backend" }],
      },
      {
        id: "step3" as const,
        label: "ขั้นตอนที่ 3: ฐานทางกฎหมาย",
        fields: [{ label: "ฐานทางกฎหมาย", value: "รอข้อมูลจริงจาก backend" }],
      },
      {
        id: "step4" as const,
        label: "ขั้นตอนที่ 4: การจัดเก็บ รักษา และทำลาย",
        fields: [{ label: "วิธีการเก็บรักษา", value: "รอข้อมูลจริงจาก backend" }],
      },
    ],
  };
}
