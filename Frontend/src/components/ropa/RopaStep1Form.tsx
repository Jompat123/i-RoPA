"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleCheck,
  Cog,
  FileText,
  Gavel,
  Handshake,
  Heart,
  Landmark,
  LibraryBig,
  Plus,
  Save,
  ScrollText,
  Shield,
  Tag,
  Upload,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RopaStepper } from "@/components/ropa/RopaStepper";

type Role = "controller" | "processor";

type DataCategory = "customer" | "employee" | "partner" | "contact";
type DataType = "general" | "sensitive";
type CollectionSource = "direct" | "other";

type LegalBasis =
  | "consent"
  | "contract"
  | "legal_obligation"
  | "vital_interest"
  | "public_task"
  | "legitimate_interest"
  | "research"
  | "other";

type StorageType = "soft" | "hard";
type SecurityMeasure =
  | "technical"
  | "physical"
  | "access_control"
  | "audit"
  | "organizational";
type RetentionOption = "2y" | "5y" | "10y" | "contract" | "other" | null;

type RopaWizardState = {
  // step 1
  role: Role;
  entityName: string;
  activity: string;
  purpose: string;
  // step 2
  personalDataTags: string[];
  dataCategory: DataCategory;
  dataType: DataType;
  collectionSource: CollectionSource;
  minorConsentEnabled: boolean;
  minorAgeOption: "under10" | "10to20" | "other" | null;
  minorAgeOther: string;
  // step 3
  legalBasis: LegalBasis[];
  legalBasisNote: string;
  disclosureNote: string;
  crossBorderTransfer: boolean;
  transferCountry: string;
  transferToAffiliate: boolean;
  affiliateCountry: string;
  transferMethod: string;
  protectionStandard: string;
  // step 4
  storageType: StorageType;
  storageMethod: string;
  retentionOption: RetentionOption;
  retentionPeriodOther: string;
  deletionMethod: string;
  rightsRefusalNote: string;
  securityMeasure: SecurityMeasure;
  securityMeasureNote: string;
};

const step1Fields = [
  {
    id: "entityName",
    label: "1. ข้อมูลเกี่ยวกับผู้ควบคุมข้อมูล / ชื่อผู้ประมวลผล",
    placeholder: "(ชื่อหน่วยงาน หรือ ชื่อบริษัท)",
  },
  {
    id: "activity",
    label: "2. กิจกรรมประมวลผล",
    placeholder: "(เช่น จัดงาน Event, ระบบรับสมัครงาน)",
  },
  {
    id: "purpose",
    label: "3. วัตถุประสงค์ของการประมวลผล",
    placeholder: "(เช่น เพื่อเก็บเป็นข้อมูลผู้เข้าร่วมงาน)",
  },
] as const;

const tagSuggestions = ["ชื่อ", "เบอร์โทร", "อีเมล", "ภาพถ่าย"] as const;

type Props = {
  recordId?: string;
  focusFix?: boolean;
};

type ApiRopaDetail = {
  processName?: string | null;
  purpose?: string | null;
  legalBasis?: string | null;
  dataCategory?: string | null;
  dataType?: string | null;
  personalDataTypes?: string[] | string | null;
  collectionMethod?: string | null;
  crossBorderTransfer?: boolean | null;
  transferCountry?: string | null;
  transferMethod?: string | null;
  protectionStandard?: string | null;
  storageMethod?: string | null;
  retentionPeriod?: string | null;
  deletionMethod?: string | null;
  securityTech?: string | null;
  securityPhysical?: string | null;
  securityOrg?: string | null;
  status?: string | null;
  reviewNote?: string | null;
};

export function RopaStep1Form({ recordId, focusFix = false }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [tagInput, setTagInput] = useState("");
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [state, setState] = useState<RopaWizardState>({
    role: "controller",
    entityName: "",
    activity: "",
    purpose: "",
    personalDataTags: [...tagSuggestions],
    dataCategory: "customer",
    dataType: "general",
    collectionSource: "direct",
    minorConsentEnabled: false,
    minorAgeOption: null,
    minorAgeOther: "",
    legalBasis: ["contract"],
    legalBasisNote: "",
    disclosureNote: "",
    crossBorderTransfer: true,
    transferCountry: "",
    transferToAffiliate: true,
    affiliateCountry: "",
    transferMethod: "",
    protectionStandard: "",
    storageType: "soft",
    storageMethod: "",
    retentionOption: null,
    retentionPeriodOther: "",
    deletionMethod: "",
    rightsRefusalNote: "",
    securityMeasure: "technical",
    securityMeasureNote: "",
  });

  function update<K extends keyof RopaWizardState>(key: K, value: RopaWizardState[K]) {
    setValidationError(null);
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function parseRetentionOption(retentionPeriod: string | null | undefined): {
    option: RetentionOption;
    customYears: string;
  } {
    const value = (retentionPeriod || "").trim();
    if (!value) return { option: null, customYears: "" };
    if (value === "2 ปี") return { option: "2y", customYears: "" };
    if (value === "5 ปี") return { option: "5y", customYears: "" };
    if (value === "10 ปี") return { option: "10y", customYears: "" };
    if (value.includes("ตลอดสัญญา")) return { option: "contract", customYears: "" };
    const years = value.match(/\d+/)?.[0] ?? "";
    return { option: years ? "other" : null, customYears: years };
  }

  useEffect(() => {
    if (!recordId) return;
    let cancelled = false;

    (async () => {
      setIsLoadingRecord(true);
      setSaveError(null);
      try {
        const res = await fetch(`/api/ropa/${recordId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลรายการเพื่อแก้ไขได้");
        const payload = (await res.json()) as ApiRopaDetail;
        if (cancelled) return;

        const retention = parseRetentionOption(payload.retentionPeriod);
        const personalDataTags = Array.isArray(payload.personalDataTypes)
          ? payload.personalDataTypes.map((x) => String(x).trim()).filter(Boolean)
          : String(payload.personalDataTypes || "")
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean);
        const legalBasis = String(payload.legalBasis || "")
          .split(",")
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean) as LegalBasis[];
        const securityMeasure: SecurityMeasure = payload.securityTech
          ? "technical"
          : payload.securityPhysical
            ? "physical"
            : payload.securityOrg
              ? "organizational"
              : "technical";

        setState((prev) => ({
          ...prev,
          activity: payload.processName?.trim() || prev.activity,
          purpose: payload.purpose?.trim() || prev.purpose,
          personalDataTags: personalDataTags.length ? personalDataTags : prev.personalDataTags,
          dataCategory:
            payload.dataCategory === "employee" ||
            payload.dataCategory === "partner" ||
            payload.dataCategory === "contact" ||
            payload.dataCategory === "customer"
              ? payload.dataCategory
              : prev.dataCategory,
          dataType: String(payload.dataType || "").toUpperCase() === "SENSITIVE" ? "sensitive" : "general",
          collectionSource: String(payload.collectionMethod || "").toUpperCase() === "OTHER" ? "other" : "direct",
          legalBasis: legalBasis.length ? legalBasis : prev.legalBasis,
          crossBorderTransfer: Boolean(payload.crossBorderTransfer),
          transferCountry: payload.transferCountry?.trim() || "",
          transferMethod: payload.transferMethod?.trim() || "",
          protectionStandard: payload.protectionStandard?.trim() || "",
          storageMethod: payload.storageMethod?.trim() || "",
          retentionOption: retention.option,
          retentionPeriodOther: retention.customYears,
          deletionMethod: payload.deletionMethod?.trim() || "",
          securityMeasure,
          securityMeasureNote:
            payload.securityTech?.trim() ||
            payload.securityPhysical?.trim() ||
            payload.securityOrg?.trim() ||
            "",
        }));

        if (focusFix || String(payload.status || "").toUpperCase() === "NEEDS_FIX") {
          setReviewNote(payload.reviewNote?.trim() || "DPO ส่งกลับให้แก้ไข กรุณาตรวจสอบและแก้ข้อมูลก่อนส่งใหม่");
        }
      } catch (error) {
        if (!cancelled) {
          setSaveError(error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลรายการได้");
        }
      } finally {
        if (!cancelled) setIsLoadingRecord(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [focusFix, recordId]);

  function goNext() {
    setValidationError(null);
    setCurrentStep((s) => (s === 4 ? 4 : ((s + 1) as 1 | 2 | 3 | 4)));
  }

  function goBack() {
    setValidationError(null);
    setCurrentStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3 | 4)));
  }

  function addTag(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (state.personalDataTags.includes(v)) return;
    update("personalDataTags", [...state.personalDataTags, v]);
  }

  function removeTag(v: string) {
    update(
      "personalDataTags",
      state.personalDataTags.filter((t) => t !== v),
    );
  }

  function toggleLegalBasis(b: LegalBasis) {
    const next = state.legalBasis.includes(b)
      ? state.legalBasis.filter((x) => x !== b)
      : [...state.legalBasis, b];
    update("legalBasis", next);
  }

  function saveDraftLocally() {
    try {
      localStorage.setItem("ropa_draft", JSON.stringify({ currentStep, ...state }));
    } catch {
      // ignore
    }
  }

  function validateStep(step: 1 | 2 | 3 | 4): string | null {
    if (step === 1) {
      if (!state.entityName.trim()) return "กรุณากรอกข้อมูลผู้ควบคุมข้อมูล / ชื่อผู้ประมวลผล";
      if (!state.activity.trim()) return "กรุณากรอกกิจกรรมประมวลผล";
      if (!state.purpose.trim()) return "กรุณากรอกวัตถุประสงค์ของการประมวลผล";
      return null;
    }
    if (step === 2) {
      if (state.personalDataTags.length === 0) return "กรุณาเพิ่มข้อมูลส่วนบุคคลที่จัดเก็บอย่างน้อย 1 รายการ";
      if (state.minorConsentEnabled && !state.minorAgeOption) return "กรุณาเลือกช่วงอายุของผู้เยาว์";
      if (state.minorConsentEnabled && state.minorAgeOption === "other" && !state.minorAgeOther.trim()) {
        return "กรุณาระบุอายุผู้เยาว์";
      }
      return null;
    }
    if (step === 3) {
      if (state.legalBasis.length === 0) return "กรุณาเลือกฐานทางกฎหมายอย่างน้อย 1 รายการ";
      if (state.crossBorderTransfer && !state.transferMethod.trim()) {
        return "กรุณากรอกวิธีการโอนข้อมูล (Transfer Method)";
      }
      return null;
    }
    if (!state.storageMethod.trim()) return "กรุณากรอกวิธีการเก็บรักษาข้อมูล";
    if (!state.retentionOption) return "กรุณาเลือกระยะเวลาการเก็บรักษา";
    if (state.retentionOption === "other" && !state.retentionPeriodOther.trim()) {
      return "กรุณาระบุระยะเวลาการเก็บรักษา (ปี)";
    }
    if (!state.deletionMethod.trim()) return "กรุณากรอกวิธีการลบหรือทำลายข้อมูล";
    return null;
  }

  function retentionPeriodLabel(): string {
    switch (state.retentionOption) {
      case "2y":
        return "2 ปี";
      case "5y":
        return "5 ปี";
      case "10y":
        return "10 ปี";
      case "contract":
        return "ตลอดสัญญา";
      case "other":
        return state.retentionPeriodOther ? `${state.retentionPeriodOther} ปี` : "";
      default:
        return "";
    }
  }

  function handleNextStep() {
    const error = validateStep(currentStep);
    if (error) {
      setValidationError(error);
      return;
    }
    saveDraftLocally();
    goNext();
  }

  async function saveDraftToServer() {
    setSaveError(null);
    setIsSavingDraft(true);
    saveDraftLocally();

    try {
      const res = await fetch(recordId ? `/api/ropa/${recordId}` : "/api/ropa/drafts", {
        method: recordId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processName: state.activity || "แบบฟอร์มที่ยังไม่ระบุชื่อกิจกรรม",
          purpose: state.purpose || null,
          personalDataTypes: state.personalDataTags,
          dataCategory: state.dataCategory,
          dataType: state.dataType === "sensitive" ? "SENSITIVE" : "GENERAL",
          collectionMethod: state.collectionSource === "direct" ? "DIRECT" : "OTHER",
          dataSource: state.entityName || null,
          legalBasis: state.legalBasis.join(","),
          crossBorderTransfer: state.crossBorderTransfer,
          transferCountry: state.transferCountry || null,
          retentionPeriod: retentionPeriodLabel() || null,
          storageMethod: state.storageMethod || null,
          deletionMethod: state.deletionMethod || null,
          securityTech:
            state.securityMeasure === "technical" ? state.securityMeasureNote || "TECHNICAL" : null,
          securityPhysical:
            state.securityMeasure === "physical" || state.securityMeasure === "access_control"
              ? state.securityMeasureNote || "PHYSICAL_OR_ACCESS"
              : null,
          securityOrg:
            state.securityMeasure === "organizational"
              ? state.securityMeasureNote || "ORGANIZATIONAL"
              : null,
          status: "DRAFT",
        }),
      });

      if (!res.ok) {
        const maybe = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(maybe?.error || "ไม่สามารถบันทึกฉบับร่างได้");
      }

      router.push("/activities?saved=1");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "ไม่สามารถบันทึกฉบับร่างได้");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function submitToServer() {
    const error = validateStep(4);
    if (error) {
      setValidationError(error);
      return;
    }

    setSaveError(null);
    setIsSubmitting(true);
    saveDraftLocally();

    const payload = {
      processName: state.activity || "แบบฟอร์มที่ยังไม่ระบุชื่อกิจกรรม",
      purpose: state.purpose || null,
      personalDataTypes: state.personalDataTags,
      dataCategory: state.dataCategory,
      dataType: state.dataType === "sensitive" ? "SENSITIVE" : "GENERAL",
      collectionMethod: state.collectionSource === "direct" ? "DIRECT" : "OTHER",
      dataSource: state.entityName || null,
      legalBasis: state.legalBasis.join(","),
      crossBorderTransfer: state.crossBorderTransfer,
      transferCountry: state.transferCountry || null,
      transferMethod: state.transferMethod || null,
      protectionStandard: state.protectionStandard || null,
      retentionPeriod: retentionPeriodLabel() || null,
      storageMethod: state.storageMethod || null,
      deletionMethod: state.deletionMethod || null,
      securityTech:
        state.securityMeasure === "technical" ? state.securityMeasureNote || "TECHNICAL" : null,
      securityPhysical:
        state.securityMeasure === "physical" || state.securityMeasure === "access_control"
          ? state.securityMeasureNote || "PHYSICAL_OR_ACCESS"
          : null,
      securityOrg:
        state.securityMeasure === "organizational"
          ? state.securityMeasureNote || "ORGANIZATIONAL"
          : null,
      reviewNote: null,
      reviewChecks: [],
      status: "PENDING",
    };

    try {
      const res = await fetch(recordId ? `/api/ropa/${recordId}` : "/api/ropa/drafts", {
        method: recordId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const maybe = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(maybe?.error || "ไม่สามารถส่งข้อมูลได้");
      }

      const response = (await res.json().catch(() => ({}))) as {
        id?: string;
        referenceCode?: string;
        code?: string;
        status?: string;
      };
      const code = encodeURIComponent(
        response.referenceCode || response.code || (recordId ? "ROPA-UPDATED" : "ROPA-NEW"),
      );
      const status = encodeURIComponent(response.status || "Pending Review");
      const activity = encodeURIComponent(state.activity || "");
      router.push(`/reports/success?code=${code}&status=${status}&activity=${activity}`);
    } catch (submitError) {
      setSaveError(submitError instanceof Error ? submitError.message : "ไม่สามารถส่งข้อมูลได้");
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageTitle =
    currentStep === 1
      ? "แบบฟอร์ม ROPA - ขั้นตอนที่ 1: ข้อมูลกิจกรรม (Activity Details)"
      : currentStep === 2
        ? "แบบฟอร์ม ROPA - ขั้นตอนที่ 2: ข้อมูลที่จัดเก็บ (Data Collection)"
        : currentStep === 3
          ? "แบบฟอร์ม ROPA - ขั้นตอนที่ 3: ฐานทางกฎหมาย (Legal Basis)"
          : "แบบฟอร์ม ROPA - ขั้นตอนที่ 4: การจัดเก็บ รักษา และทำลาย (Retention & Security)";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
          {pageTitle}
        </h1>
        {recordId ? (
          <p className="mt-2 text-sm text-slate-500">โหมดแก้ไขรายการ: {recordId}</p>
        ) : null}
      </div>

      {isLoadingRecord ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          กำลังโหลดข้อมูลเดิมของรายการ...
        </div>
      ) : null}

      {reviewNote ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p className="font-semibold">หมายเหตุจาก DPO (ต้องแก้ไข)</p>
          <p className="mt-1">{reviewNote}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 md:p-10">
        <RopaStepper currentStep={currentStep} />

        {currentStep === 1 ? (
          <>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <button
                type="button"
                onClick={() => update("role", "controller")}
                className={`relative flex gap-5 rounded-2xl border-2 p-6 text-left transition-all ${
                  state.role === "controller"
                    ? "border-blue-800 bg-blue-50/40 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white opacity-90 hover:border-slate-300"
                }`}
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                    state.role === "controller"
                      ? "bg-blue-800 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Shield className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 pr-8">
                  <h3 className="text-base font-bold text-slate-900">
                    ผู้ควบคุมข้อมูล (Controller)
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    ผู้ที่มีอำนาจตัดสินใจเกี่ยวกับวัตถุประสงค์และวิธีการประมวลผลข้อมูลส่วนบุคคล
                  </p>
                </div>
                <span
                  className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    state.role === "controller"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {state.role === "controller" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : null}
                </span>
              </button>

              <button
                type="button"
                onClick={() => update("role", "processor")}
                className={`relative flex gap-5 rounded-2xl border-2 p-6 text-left transition-all ${
                  state.role === "processor"
                    ? "border-blue-800 bg-blue-50/40 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white opacity-90 hover:border-slate-300"
                }`}
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
                    state.role === "processor"
                      ? "bg-blue-800 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Cog className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0 pr-8">
                  <h3 className="text-base font-bold text-slate-900">
                    ผู้ประมวลผลข้อมูล (Processor)
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    ผู้ประมวลผลข้อมูลส่วนบุคคลตามคำสั่งหรือในนามของผู้ควบคุมข้อมูล
                  </p>
                </div>
                <span
                  className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    state.role === "processor"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {state.role === "processor" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : null}
                </span>
              </button>
            </div>

            <div className="mt-10 space-y-8">
              {step1Fields.map((field) => (
                <div key={field.id} className="flex flex-col gap-2">
                  <label
                    htmlFor={field.id}
                    className="text-[15px] font-semibold text-slate-700"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.id}
                    type="text"
                    value={state[field.id]}
                    onChange={(e) => update(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <div className="mt-10 space-y-8">
              <section>
                <h2 className="text-sm font-semibold text-slate-700">
                  4. ข้อมูลส่วนบุคคลที่จัดเก็บ
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {state.personalDataTags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      <Tag className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        aria-label={`ลบแท็ก ${t}`}
                      >
                        <Circle className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="เพิ่มแท็ก (เช่น เลขบัตร)"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addTag(tagInput);
                      setTagInput("");
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    เพิ่ม
                  </button>
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-slate-700">
                  5. หมวดหมู่ของข้อมูล
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(
                    [
                      { id: "customer", label: "ลูกค้า", Icon: UsersRound },
                      { id: "employee", label: "พนักงาน", Icon: UserRound },
                      { id: "partner", label: "คู่ค้า", Icon: Handshake },
                      { id: "contact", label: "ผู้ติดต่อ", Icon: FileText },
                    ] as const
                  ).map(({ id, label, Icon }) => {
                    const active = state.dataCategory === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update("dataCategory", id)}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-semibold transition ${
                          active
                            ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <Icon
                          className={`h-7 w-7 ${active ? "text-blue-700" : "text-slate-400"}`}
                          strokeWidth={2}
                          aria-hidden
                        />
                        <span className={active ? "text-blue-900" : "text-slate-700"}>
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-slate-700">
                  6. ประเภทของข้อมูล
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {(
                    [
                      { id: "general", label: "ข้อมูลทั่วไป", note: "ข้อมูลส่วนบุคคลทั่วไป" },
                      { id: "sensitive", label: "ข้อมูลอ่อนไหว", note: "ข้อมูลตามกฎหมายที่ต้องระวัง" },
                    ] as const
                  ).map(({ id, label, note }) => {
                    const active = state.dataType === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => update("dataType", id)}
                        className={`flex items-center justify-between gap-4 rounded-2xl border p-5 text-left transition ${
                          active
                            ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-800">{label}</div>
                          <div className="mt-1 text-xs text-slate-500">{note}</div>
                        </div>
                        {active ? (
                          <CircleCheck className="h-6 w-6 text-blue-700" aria-hidden />
                        ) : (
                          <Circle className="h-6 w-6 text-slate-300" aria-hidden />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-sm font-semibold text-slate-700">
                      10. การขอความยินยอมของผู้เยาว์
                    </h2>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={state.minorConsentEnabled}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          update("minorConsentEnabled", enabled);
                          if (!enabled) {
                            update("minorAgeOption", null);
                            update("minorAgeOther", "");
                          }
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200"
                      />
                      ใช้
                    </label>
                  </div>

                  <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${state.minorConsentEnabled ? "" : "opacity-50"}`}>
                    {(
                      [
                        { id: "under10", label: "อายุไม่เกิน 10 ปี" },
                        { id: "10to20", label: "อายุ 10 - 20 ปี" },
                        { id: "other", label: "อายุ (อื่นๆ)" },
                      ] as const
                    ).map((opt) => {
                      const checked = state.minorAgeOption === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                            checked
                              ? "border-blue-700 bg-blue-50 text-blue-900"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                          } ${state.minorConsentEnabled ? "" : "pointer-events-none"}`}
                        >
                          <span>{opt.label}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              if (!state.minorConsentEnabled) return;
                              update("minorAgeOption", checked ? null : opt.id);
                              if (opt.id !== "other") update("minorAgeOther", "");
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200"
                          />
                        </label>
                      );
                    })}
                  </div>

                  {state.minorConsentEnabled && state.minorAgeOption === "other" ? (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">
                        ระบุอายุ
                      </label>
                      <input
                        inputMode="numeric"
                        value={state.minorAgeOther}
                        onChange={(e) =>
                          update(
                            "minorAgeOther",
                            e.target.value.replace(/[^\d]/g, "").slice(0, 3),
                          )
                        }
                        placeholder="เช่น 7"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
            <div className="mt-10 space-y-8">
              <section>
                <h2 className="text-sm font-semibold text-slate-700">
                  11. ฐานในการประมวลผล (Legal Basis)
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(
                    [
                      { id: "consent", label: "Consent", sub: "(ความยินยอม)", Icon: ScrollText },
                      { id: "contract", label: "Contract", sub: "(สัญญา)", Icon: FileText },
                      { id: "legal_obligation", label: "Legal Obligation", sub: "(หน้าที่ตามกฎหมาย)", Icon: Gavel },
                      { id: "vital_interest", label: "Vital interest", sub: "(ประโยชน์ที่สำคัญยิ่ง)", Icon: Heart },
                      { id: "public_task", label: "Public Task", sub: "(ภารกิจรัฐ)", Icon: Landmark },
                      { id: "legitimate_interest", label: "Legitimate Interest", sub: "(ประโยชน์โดยชอบด้วยกฎหมาย)", Icon: LibraryBig },
                      { id: "research", label: "Research", sub: "(การวิจัย)", Icon: FileText },
                      { id: "other", label: "Other", sub: "(อื่นๆ)", Icon: FileText },
                    ] as const
                  ).map(({ id, label, sub, Icon }) => {
                    const active = state.legalBasis.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleLegalBasis(id)}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center transition ${
                          active
                            ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 ${active ? "text-blue-700" : "text-slate-400"}`}
                          strokeWidth={2}
                          aria-hidden
                        />
                        <div className="text-sm font-semibold text-slate-800">{label}</div>
                        <div className="text-[11px] text-slate-500">{sub}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-600">
                    ข้อความเพิ่มเติม
                  </label>
                  <input
                    type="text"
                    value={state.legalBasisNote}
                    onChange={(e) => update("legalBasisNote", e.target.value)}
                    placeholder="(กรณีเลือก Other หรืออธิบายเพิ่มเติม)"
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-slate-700">
                  12. การใช้หรือเปิดเผยข้อมูลส่วนบุคคล (ที่ได้รับยกเว้น)
                </h2>
                <input
                  type="text"
                  value={state.disclosureNote}
                  onChange={(e) => update("disclosureNote", e.target.value)}
                  placeholder="เช่น เปิดเผยให้หน่วยงานรัฐตามกฎหมาย"
                  className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </section>

              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-slate-700">
                    13. ส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศหรือไม่?
                  </h2>
                  <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="crossBorderTransfer"
                        checked={state.crossBorderTransfer === true}
                        onChange={() => update("crossBorderTransfer", true)}
                        className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-200"
                      />
                      มี (Yes)
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="crossBorderTransfer"
                        checked={state.crossBorderTransfer === false}
                        onChange={() => {
                          update("crossBorderTransfer", false);
                          update("transferCountry", "");
                          update("transferToAffiliate", false);
                          update("affiliateCountry", "");
                          update("transferMethod", "");
                          update("protectionStandard", "");
                        }}
                        className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-200"
                      />
                      ไม่มี (No)
                    </label>
                  </div>
                </div>

                <div className={`space-y-3 ${state.crossBorderTransfer ? "" : "opacity-50 pointer-events-none"}`}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr] sm:items-center">
                    <div className="text-xs font-semibold text-slate-600">
                      13.1 มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่? (ถ้ามีโปรดระบุชื่อประเทศ)
                    </div>
                    <input
                      type="text"
                      value={state.transferCountry}
                      onChange={(e) => update("transferCountry", e.target.value)}
                      placeholder="ประเทศ"
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_2fr] sm:items-center">
                    <div className="text-xs font-semibold text-slate-600">
                      13.2 เป็นการส่งให้บริษัทในเครือหรือไม่? (ถ้ามีโปรดระบุชื่อประเทศ)
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="transferToAffiliate"
                          checked={state.transferToAffiliate === true}
                          onChange={() => update("transferToAffiliate", true)}
                          className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-200"
                        />
                        มี (Yes)
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="radio"
                          name="transferToAffiliate"
                          checked={state.transferToAffiliate === false}
                          onChange={() => {
                            update("transferToAffiliate", false);
                            update("affiliateCountry", "");
                          }}
                          className="h-4 w-4 border-slate-300 text-blue-700 focus:ring-blue-200"
                        />
                        ไม่มี (No)
                      </label>
                    </div>
                    <input
                      type="text"
                      value={state.affiliateCountry}
                      onChange={(e) => update("affiliateCountry", e.target.value)}
                      placeholder="ประเทศ"
                      className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                        state.transferToAffiliate ? "" : "opacity-60"
                      }`}
                      disabled={!state.transferToAffiliate}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr] sm:items-center">
                    <div className="text-xs font-semibold text-slate-600">
                      13.3 วิธีการโอนข้อมูล (Transfer Method)
                    </div>
                    <input
                      type="text"
                      value={state.transferMethod}
                      onChange={(e) => update("transferMethod", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_2fr] sm:items-center">
                    <div className="text-xs font-semibold text-slate-600">
                      13.4 มาตรฐานการคุ้มครองข้อมูลฯ / ข้อยกเว้น ม.28 (Protection Standard)
                    </div>
                    <input
                      type="text"
                      value={state.protectionStandard}
                      onChange={(e) => update("protectionStandard", e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : null}

        {currentStep === 4 ? (
          <>
            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <section>
                  <h2 className="text-sm font-semibold text-slate-700">
                    12. นโยบายการเก็บรักษาข้อมูลส่วนบุคคล
                  </h2>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(
                      [
                        {
                          id: "soft",
                          title: "Soft file (Digital)",
                          Icon: Upload,
                        },
                        {
                          id: "hard",
                          title: "Hard copy (Physical)",
                          Icon: FileText,
                        },
                      ] as const
                    ).map(({ id, title, Icon }) => {
                      const active = state.storageType === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => update("storageType", id)}
                          className={`relative flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                            active
                              ? "border-blue-700 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <span
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                              active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                          </span>
                          <div className="font-semibold text-slate-800">{title}</div>
                          <span className="absolute right-4 top-4">
                            {active ? (
                              <CircleCheck className="h-6 w-6 text-blue-700" aria-hidden />
                            ) : (
                              <Circle className="h-6 w-6 text-slate-300" aria-hidden />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">
                        วิธีการเก็บรักษาข้อมูล
                      </label>
                      <input
                        type="text"
                        value={state.storageMethod}
                        onChange={(e) => update("storageMethod", e.target.value)}
                        placeholder="เช่น เก็บใน Google Drive, ใส่ตู้ล็อกกุญแจ"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">
                        ระยะเวลาการเก็บรักษา
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {(
                          [
                            { id: "2y", label: "2 ปี" },
                            { id: "5y", label: "5 ปี" },
                            { id: "10y", label: "10 ปี" },
                            { id: "contract", label: "ตลอดสัญญา" },
                            { id: "other", label: "อื่นๆ" },
                          ] as const
                        ).map((option) => {
                          const active = state.retentionOption === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => update("retentionOption", option.id)}
                              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                active
                                  ? "border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-100"
                                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                              }`}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                      {state.retentionOption === "other" ? (
                        <div className="mt-3">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={state.retentionPeriodOther}
                            onChange={(e) =>
                              update(
                                "retentionPeriodOther",
                                e.target.value.replace(/[^\d]/g, "").slice(0, 3),
                              )
                            }
                            placeholder="กรอกจำนวนปี (เช่น 3)"
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">
                        วิธีการลบหรือทำลายข้อมูล
                      </label>
                      <input
                        type="text"
                        value={state.deletionMethod}
                        onChange={(e) => update("deletionMethod", e.target.value)}
                        placeholder="[ เครื่องทำลายเอกสาร / ลบไฟล์จากระบบ / Format ]"
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </section>

                {state.role !== "processor" ? (
                  <>
                    <section>
                      <h2 className="text-sm font-semibold text-slate-700">
                        14. การปฏิเสธคำขอการใช้สิทธิ (ของเจ้าของข้อมูล)
                      </h2>
                      <input
                        type="text"
                        value={state.rightsRefusalNote}
                        onChange={(e) => update("rightsRefusalNote", e.target.value)}
                        placeholder="(ปกติจะปล่อยว่างไว้ เอาไว้กรอกเวลามีเคสเกิดขึ้นจริง)"
                        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </section>

                    <section>
                      <h2 className="text-sm font-semibold text-slate-700">
                        15. มาตรการรักษาความมั่นคงปลอดภัย
                      </h2>
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {(
                          [
                            { id: "technical", label: "มาตรการเชิงเทคนิค", Icon: Shield },
                            { id: "physical", label: "มาตรการทางกายภาพ", Icon: Shield },
                            { id: "access_control", label: "การควบคุมการเข้าถึง", Icon: Shield },
                            { id: "audit", label: "มาตรการตรวจสอบย้อนหลัง", Icon: Shield },
                            { id: "organizational", label: "มาตรการเชิงองค์กร", Icon: Shield },
                          ] as const
                        ).map(({ id, label, Icon }) => {
                          const active = state.securityMeasure === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => update("securityMeasure", id)}
                              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-center transition ${
                                active
                                  ? "border-slate-900/80 bg-blue-50 ring-2 ring-blue-100"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <span
                                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                                  active ? "bg-blue-800 text-white" : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                <Icon className="h-7 w-7" strokeWidth={2} aria-hidden />
                              </span>
                              <span className="text-xs font-semibold leading-snug text-slate-700">
                                {label}
                              </span>
                              <span className="absolute right-3 top-3">
                                {active ? (
                                  <CircleCheck className="h-5 w-5 text-blue-700" aria-hidden />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-300" aria-hidden />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={state.securityMeasureNote}
                        onChange={(e) => update("securityMeasureNote", e.target.value)}
                        placeholder="(การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน)"
                        className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </section>
                  </>
                ) : null}
              </div>

              <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800">รีวิวสรุปข้อมูล</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <details className="group rounded-xl border border-slate-200 bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-slate-800">
                      <span>ขั้นตอนที่ 1: กิจกรรม</span>
                      <ChevronRight className="h-4 w-4 text-slate-500 transition group-open:rotate-90" aria-hidden />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-slate-700">
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">บทบาท: </span>
                        {state.role === "controller" ? "Controller" : "Processor"}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">ผู้ควบคุม/ผู้ประมวลผล: </span>
                        {state.entityName || "—"}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">กิจกรรม: </span>
                        {state.activity || "—"}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">วัตถุประสงค์: </span>
                        {state.purpose || "—"}
                      </div>
                    </div>
                  </details>

                  <details className="group rounded-xl border border-slate-200 bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-slate-800">
                      <span>ขั้นตอนที่ 2: ข้อมูลที่จัดเก็บ</span>
                      <ChevronRight className="h-4 w-4 text-slate-500 transition group-open:rotate-90" aria-hidden />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-slate-700">
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">แท็ก: </span>
                        {state.personalDataTags.slice(0, 6).join(", ")}
                        {state.personalDataTags.length > 6 ? "…" : ""}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">หมวดหมู่: </span>
                        {state.dataCategory}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">ประเภทข้อมูล: </span>
                        {state.dataType}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">ผู้เยาว์: </span>
                        {state.minorConsentEnabled
                          ? state.minorAgeOption === "other"
                            ? `อายุ ${state.minorAgeOther || "—"}`
                            : state.minorAgeOption === "under10"
                              ? "อายุไม่เกิน 10 ปี"
                              : state.minorAgeOption === "10to20"
                                ? "อายุ 10–20 ปี"
                                : "—"
                          : "ไม่ระบุ"}
                      </div>
                    </div>
                  </details>

                  <details className="group rounded-xl border border-slate-200 bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-slate-800">
                      <span>ขั้นตอนที่ 3: ฐานทางกฎหมาย</span>
                      <ChevronRight className="h-4 w-4 text-slate-500 transition group-open:rotate-90" aria-hidden />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-slate-700">
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">เลือก: </span>
                        {state.legalBasis.join(", ") || "—"}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">เปิดเผย: </span>
                        {state.disclosureNote || "—"}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">โอนไปต่างประเทศ: </span>
                        {state.crossBorderTransfer ? "มี" : "ไม่มี"}
                      </div>
                      {state.crossBorderTransfer ? (
                        <>
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-slate-600">ประเทศ: </span>
                            {state.transferCountry || "—"}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-slate-600">บริษัทในเครือ: </span>
                            {state.transferToAffiliate ? "มี" : "ไม่มี"}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </details>

                  <details className="group rounded-xl border border-slate-200 bg-slate-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium text-slate-800">
                      <span>ขั้นตอนที่ 4: การจัดเก็บ</span>
                      <ChevronRight className="h-4 w-4 text-slate-500 transition group-open:rotate-90" aria-hidden />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-slate-700">
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">ประเภท: </span>
                        {state.storageType === "soft" ? "Soft file" : "Hard copy"}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">วิธีเก็บ: </span>
                        {state.storageMethod || "—"}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">ระยะเวลา: </span>
                        {retentionPeriodLabel() || "—"}
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-semibold text-slate-600">วิธีลบ: </span>
                        {state.deletionMethod || "—"}
                      </div>
                      {state.role !== "processor" ? (
                        <>
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-slate-600">การปฏิเสธการใช้สิทธิ: </span>
                            {state.rightsRefusalNote || "—"}
                          </div>
                          <div className="mt-2">
                            <span className="text-xs font-semibold text-slate-600">มาตรการความปลอดภัย: </span>
                            {state.securityMeasure}
                          </div>
                        </>
                      ) : null}
                    </div>
                  </details>
                </div>
              </aside>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={saveDraftToServer}
          disabled={isSavingDraft || isLoadingRecord}
          className="rounded-full bg-[#0057cc] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 active:scale-[0.98]"
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Save className="h-4 w-4" aria-hidden />
            {isSavingDraft ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
          </span>
        </button>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full bg-slate-500 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-600"
          >
            ยกเลิก
          </button>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-500 px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-600"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              ย้อนกลับ
            </button>
          ) : null}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                handleNextStep();
              }}
              disabled={isLoadingRecord}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0057cc] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 active:scale-[0.98]"
            >
              บันทึกและถัดไป
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                void submitToServer();
              }}
              disabled={isLoadingRecord || isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0057cc] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 active:scale-[0.98]"
            >
              <Upload className="h-4 w-4" aria-hidden />
              {isSubmitting ? "กำลังส่ง..." : "ส่งข้อมูล"}
            </button>
          )}
        </div>
      </div>
      {validationError ? <p className="text-sm font-medium text-amber-700">{validationError}</p> : null}
      {saveError ? <p className="text-sm font-medium text-rose-600">{saveError}</p> : null}
    </div>
  );
}
