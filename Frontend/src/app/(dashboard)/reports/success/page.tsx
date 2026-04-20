import Link from "next/link";

import { CheckCircle2, FileText, Inbox, ShieldCheck } from "lucide-react";

import { requireDataOwner } from "@/lib/auth/require-data-owner";

type SuccessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function ReportSuccessPage({ searchParams }: SuccessPageProps) {
  await requireDataOwner();
  const params = (await searchParams) ?? {};

  const code = getParam(params, "code") ?? "ROPA-2023-001";
  const status = getParam(params, "status") ?? "Pending Review";
  const activity = getParam(params, "activity") ?? "—";

  return (
    <div className="mx-auto flex w-full max-w-4xl justify-center py-6 md:py-10">
      <div className="w-full rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-300/30 md:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full border-2 border-emerald-200/70" />
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="h-9 w-9" strokeWidth={2.5} aria-hidden />
            </div>
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            ส่งข้อมูลสำเร็จเรียบร้อยแล้ว!
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-500">
            รายการของคุณได้รับการบันทึกและส่งต่อไปยัง DPO เพื่อตรวจสอบแล้ว
          </p>

          <div className="mt-6 w-full rounded-2xl bg-slate-50 px-6 py-5 text-left">
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3 sm:gap-4">
              <div>
                <dt className="text-slate-400">รหัสรายการ:</dt>
                <dd className="mt-1 font-semibold text-slate-800">{code}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-slate-400">ชื่อกิจกรรม:</dt>
                <dd className="mt-1 font-semibold text-slate-800">{activity}</dd>
              </div>
              <div>
                <dt className="text-slate-400">สถานะ:</dt>
                <dd className="mt-1 font-semibold text-slate-800">{status}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 w-full text-left">
            <h2 className="text-sm font-semibold text-slate-800">What&apos;s Next?</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <ShieldCheck className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    1. DPO ตรวจสอบข้อมูล
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    ตรวจสอบความครบถ้วนและความถูกต้องของข้อมูล
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <Inbox className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    2. แจ้งผลทางอีเมล/ในระบบ
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    ระบบจะอัปเดตสถานะเมื่อมีผลการตรวจสอบ
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
                  <FileText className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    3. บันทึก/ติดตามรายการ ROPA
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    ดูรายการทั้งหมดและติดตามสถานะได้ตลอดเวลา
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[#0057cc] px-8 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-800"
            >
              กลับสู่หน้าหลัก
            </Link>
            <Link
              href="/activities"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              ดูรายการของฉัน
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

