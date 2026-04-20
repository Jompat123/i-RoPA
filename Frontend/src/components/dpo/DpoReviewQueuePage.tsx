"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import type { DpoReviewQueueData } from "@/types/dpo";

type Props = { data: DpoReviewQueueData };

function riskLevel(id: string): "สูง" | "กลาง" | "ต่ำ" {
  const score = id.split("").reduce((sum, x) => sum + x.charCodeAt(0), 0) % 3;
  if (score === 0) return "สูง";
  if (score === 1) return "กลาง";
  return "ต่ำ";
}

function riskClass(level: "สูง" | "กลาง" | "ต่ำ"): string {
  if (level === "สูง") return "text-rose-600";
  if (level === "กลาง") return "text-amber-500";
  return "text-emerald-500";
}

function statusLabel(status: "pending" | "approved" | "needs_fix"): string {
  if (status === "approved") return "อนุมัติแล้ว";
  if (status === "needs_fix") return "ส่งกลับแก้ไข";
  return "รอตรวจ";
}

function statusClass(status: "pending" | "approved" | "needs_fix"): string {
  if (status === "approved") return "bg-emerald-100 text-emerald-700";
  if (status === "needs_fix") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export function DpoReviewQueuePage({ data }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const updatedId = searchParams.get("id");
  const showUpdatedToast = searchParams.get("updated") === "1";
  const hasQuery = useMemo(() => searchParams.toString().length > 0, [searchParams]);

  function setFilters(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      {showUpdatedToast ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          อัปเดตผลการพิจารณาเรียบร้อยแล้ว{updatedId ? ` (ID: ${updatedId})` : ""}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-3xl font-semibold text-slate-800">รายการที่รอการอนุมัติ</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">ตัวกรองข้อมูล</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              data.source === "api" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            แหล่งข้อมูล: {data.source === "api" ? "Backend API" : "Mock"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            value={data.filters.department}
            onChange={(event) => setFilters({ department: event.target.value })}
          >
            <option value="">ทุกแผนก</option>
            {data.departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="ค้นหา ROPA ID / กิจกรรม / ผู้ส่ง"
            defaultValue={data.filters.q}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setFilters({ q: (event.target as HTMLInputElement).value.trim() });
              }
            }}
          />

          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            value={data.filters.status}
            onChange={(event) => setFilters({ status: event.target.value })}
          >
            <option value="all">คำขอที่ต้องให้ DPO ตรวจ</option>
            <option value="pending">รายการใหม่จาก Data Owner</option>
            <option value="needs_fix">รายการส่งกลับมาตรวจซ้ำ</option>
          </select>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => router.push(pathname)}
            disabled={!hasQuery}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ล้างตัวกรอง
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3">ROPA ID</th>
                <th className="px-5 py-3">กิจกรรม</th>
                <th className="px-5 py-3">แผนก</th>
                <th className="px-5 py-3">ผู้ส่ง</th>
                <th className="px-5 py-3">วันที่ส่ง</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3">ระดับความเสี่ยง</th>
                <th className="px-5 py-3 text-right">ตรวจสอบ</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => {
                const risk = riskLevel(row.id);
                return (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{row.code}</td>
                  <td className="px-5 py-3 text-slate-700">{row.processName}</td>
                  <td className="px-5 py-3 text-slate-700">{row.department}</td>
                  <td className="px-5 py-3 text-slate-700">
                    <div className="flex flex-col">
                      <span>{row.ownerName}</span>
                      <span className="text-xs text-slate-500">Data Owner</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{row.submittedAtLabel}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status)}`}>
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className={`px-5 py-3 font-semibold ${riskClass(risk)}`}>{risk}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/dpo/reviews/${row.id}`}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      ตรวจและอนุมัติ
                    </Link>
                  </td>
                </tr>
              )})}
              {data.rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    ไม่พบข้อมูลตามตัวกรอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
