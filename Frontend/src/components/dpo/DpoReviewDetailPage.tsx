"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DataSourceBanner } from "@/components/common/DataSourceBanner";
import type { DpoReviewDetailData } from "@/types/dpo";

type Props = { data: DpoReviewDetailData };
type CheckState = "pass" | "fail" | "todo";
type FieldCheck = {
  id: string;
  stepId: DpoReviewDetailData["stepForms"][number]["id"];
  label: string;
  value: string;
};

function readDraft(id: string): {
  stateById?: Record<string, CheckState>;
  itemNote?: Record<string, string>;
  globalNote?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`dpo_review_draft_${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as {
      stateById?: Record<string, CheckState>;
      itemNote?: Record<string, string>;
      globalNote?: string;
    };
  } catch {
    return null;
  }
}

export function DpoReviewDetailPage({ data }: Props) {
  const router = useRouter();
  const fieldChecks = useMemo<FieldCheck[]>(
    () =>
      data.stepForms.flatMap((step) =>
        step.fields.map((field, index) => ({
          id: `${step.id}:${index}`,
          stepId: step.id,
          label: field.label,
          value: field.value || "-",
        })),
      ),
    [data.stepForms],
  );
  const [isPending, startTransition] = useTransition();
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [globalNote, setGlobalNote] = useState("");
  const [itemNote, setItemNote] = useState<Record<string, string>>({});
  const [stateById, setStateById] = useState<Record<string, CheckState>>(() =>
    Object.fromEntries(fieldChecks.map((field) => [field.id, "todo"])) as Record<string, CheckState>,
  );
  const [activeStep, setActiveStep] = useState<DpoReviewDetailData["stepForms"][number]["id"]>(
    data.stepForms[0]?.id ?? "step1",
  );
  const [error, setError] = useState<string | null>(null);
  const draftKey = `dpo_review_draft_${data.id}`;
  const activeFields = fieldChecks.filter((field) => field.stepId === activeStep);

  const summary = useMemo(() => {
    const values = Object.values(stateById);
    return {
      pass: values.filter((x) => x === "pass").length,
      fail: values.filter((x) => x === "fail").length,
      todo: values.filter((x) => x === "todo").length,
    };
  }, [stateById]);

  const isReadyToApprove = summary.todo === 0 && summary.fail === 0;

  useEffect(() => {
    queueMicrotask(() => {
      const draft = readDraft(data.id);
      if (draft) {
        setGlobalNote(draft.globalNote ?? "");
        setItemNote(draft.itemNote ?? {});
        setStateById((prev) => {
          const next = { ...prev };
          for (const field of fieldChecks) {
            const fromDraft = draft.stateById?.[field.id];
            if (fromDraft === "pass" || fromDraft === "fail" || fromDraft === "todo") {
              next[field.id] = fromDraft;
            }
          }
          return next;
        });
      }
      setDraftHydrated(true);
    });
  }, [data.id, fieldChecks]);

  useEffect(() => {
    if (!draftHydrated) return;
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          stateById,
          itemNote,
          globalNote,
        }),
      );
    } catch {
      // ignore storage quota errors
    }
  }, [draftHydrated, draftKey, globalNote, itemNote, stateById]);

  function onSubmit(action: "approve" | "reject") {
    if (action === "approve" && !isReadyToApprove) {
      setError("ต้องตรวจครบทุกหัวข้อและไม่มีหัวข้อไม่ผ่านก่อนอนุมัติ");
      return;
    }
    if (action === "reject" && !globalNote.trim()) {
      setError("กรุณากรอกหมายเหตุภาพรวมก่อนส่งกลับแก้ไข");
      return;
    }
    const failedWithoutReason = fieldChecks.some(
      (field) => stateById[field.id] === "fail" && !(itemNote[field.id] || "").trim(),
    );
    if (action === "reject" && failedWithoutReason) {
      setError("กรุณาระบุเหตุผลในทุกฟิลด์ที่ไม่ผ่านก่อนส่งกลับ");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/dpo/reviews/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          globalNote,
          checks: fieldChecks.map((field) => ({
            key: field.id,
            result: stateById[field.id],
            note: itemNote[field.id] || "",
          })),
        }),
      });

      if (!res.ok) {
        setError(action === "approve" ? "อนุมัติไม่สำเร็จ กรุณาลองใหม่" : "ส่งกลับแก้ไขไม่สำเร็จ กรุณาลองใหม่");
        return;
      }

      try {
        localStorage.removeItem(draftKey);
      } catch {
        // ignore
      }
      router.push(`/dpo/reviews?updated=1&id=${data.id}`);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <DataSourceBanner source={data.source} loadError={data.loadError ?? null} />
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h1 className="text-3xl font-semibold text-slate-900">ตรวจสอบและอนุมัติ ROPA (ROPA Review & Approval)</h1>
          <p className="mt-1 text-sm text-slate-600">
            คำขอจาก Data Owner: {data.ownerName} ({data.department}) - {data.code}
          </p>
        </div>

        <div className="grid grid-cols-4 border-b border-slate-100 text-center text-sm text-slate-500">
          {data.stepForms.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`px-3 py-3 ${
                activeStep === step.id ? "border-b-2 border-blue-600 font-semibold text-slate-800" : ""
              }`}
            >
              {step.label.replace("ขั้นตอนที่ ", "ขั้น ")}{" "}
              <span className="text-xs">
                (
                {fieldChecks.filter((x) => x.stepId === step.id && stateById[x.id] === "pass").length}/
                {fieldChecks.filter((x) => x.stepId === step.id).length})
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="mb-3 text-lg font-semibold text-slate-900">
              {data.stepForms.find((x) => x.id === activeStep)?.label}
            </p>
            <div className="space-y-3">
              {activeFields.map((field) => {
                const state = stateById[field.id];
                return (
                  <div
                    key={field.id}
                    className={`rounded-lg border p-3 ${
                      state === "fail" ? "border-rose-200 bg-rose-50/70" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-[260px] flex-1">
                        <p className="text-sm font-semibold text-slate-800">{field.label}</p>
                        <p className="mt-1 text-sm text-slate-700">{field.value}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setStateById((prev) => ({ ...prev, [field.id]: "pass" }))}
                          className={`rounded-full px-3 py-1 ${
                            state === "pass" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          ผ่าน
                        </button>
                        <button
                          type="button"
                          onClick={() => setStateById((prev) => ({ ...prev, [field.id]: "fail" }))}
                          className={`rounded-full px-3 py-1 ${
                            state === "fail" ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          ไม่ผ่าน
                        </button>
                        <button
                          type="button"
                          onClick={() => setStateById((prev) => ({ ...prev, [field.id]: "todo" }))}
                          className={`rounded-full px-3 py-1 ${
                            state === "todo" ? "bg-slate-700 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          รอตรวจ
                        </button>
                      </div>
                    </div>
                    <textarea
                      className={`mt-2 min-h-16 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                        state === "fail"
                          ? "border-rose-200 bg-rose-50/50 focus:border-rose-300"
                          : "border-slate-200 focus:border-indigo-400"
                      }`}
                      placeholder="เหตุผล/ข้อเสนอแนะรายฟิลด์ (บังคับเมื่อไม่ผ่าน)"
                      value={itemNote[field.id] ?? ""}
                      onChange={(event) =>
                        setItemNote((prev) => ({
                          ...prev,
                          [field.id]: event.target.value,
                        }))
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-700">
            สรุปผลการตรวจสอบ: <span className="font-semibold text-emerald-600">ผ่าน {summary.pass} รายการ</span>,{" "}
            <span className="font-semibold text-rose-600">ไม่ผ่าน {summary.fail} รายการ</span>, ทั้งหมด {fieldChecks.length} รายการ
          </p>
          <textarea
            className="mt-3 min-h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="หมายเหตุภาพรวมสำหรับผู้ขอ"
            value={globalNote}
            onChange={(event) => setGlobalNote(event.target.value)}
          />
          {error && <p className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              className="rounded-full bg-slate-500 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-600"
              disabled={isPending}
              onClick={() => router.push("/dpo/reviews")}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="rounded-full bg-slate-300 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed"
              disabled={isPending || !isReadyToApprove}
              onClick={() => onSubmit("approve")}
            >
              {isPending ? "กำลังบันทึก..." : "อนุมัติคำขอ"}
            </button>
            <button
              type="button"
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              onClick={() => onSubmit("reject")}
            >
              {isPending ? "กำลังบันทึก..." : "ส่งกลับให้ Data Owner แก้ไข"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
