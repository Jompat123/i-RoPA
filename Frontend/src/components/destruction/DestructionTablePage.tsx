import { Download, Search } from "lucide-react";

import { DataSourceBanner } from "@/components/common/DataSourceBanner";
import type { DestructionPageData, DestructionStatus } from "@/types/records";

type Props = {
  data: DestructionPageData;
};

function statusStyle(status: DestructionStatus): { label: string; className: string } {
  switch (status) {
    case "destroyed":
      return { label: "หมดอายุแล้ว", className: "bg-rose-100 text-rose-700" };
    case "near_expiry":
      return { label: "ใกล้หมดอายุ", className: "bg-amber-100 text-amber-700" };
    case "expired":
      return { label: "เกินกำหนด", className: "bg-orange-100 text-orange-700" };
    default:
      return { label: "-", className: "bg-slate-100 text-slate-700" };
  }
}

export function DestructionTablePage({ data }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DataSourceBanner source={data.source} loadError={data.loadError ?? null} />
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">ตรวจสอบการทำลายข้อมูล</h1>

        <form method="GET" className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <select
            name="status"
            defaultValue={data.filters.status}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">สถานะ</option>
            <option value="near_expiry">ใกล้หมดอายุ</option>
            <option value="expired">เกินกำหนด</option>
            <option value="destroyed">หมดอายุแล้ว</option>
          </select>

          <select
            name="department"
            defaultValue={data.filters.department}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">แผนก</option>
            {data.departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="startDate"
            defaultValue={data.filters.startDate}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="date"
            name="endDate"
            defaultValue={data.filters.endDate}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <label className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              name="q"
              defaultValue={data.filters.q}
              placeholder="ค้นหากิจกรรม..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button
            type="submit"
            className="h-10 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 md:col-span-5 md:justify-self-end"
          >
            ค้นหา
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">กิจกรรม</th>
                <th className="px-4 py-3">แผนก</th>
                <th className="px-4 py-3">วันที่ครบกำหนด</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">หลักฐานการทำลาย</th>
                <th className="px-4 py-3">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {data.rows.map((row) => {
                const status = statusStyle(row.status);
                return (
                  <tr key={row.id} className="border-t border-slate-100 text-slate-700">
                    <td className="px-4 py-3">{row.activityName}</td>
                    <td className="px-4 py-3">{row.departmentName}</td>
                    <td className="px-4 py-3">{row.dueDateLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.proofUrl ? (
                        <a
                          href={row.proofUrl}
                          className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden />
                          {row.proofLabel}
                        </a>
                      ) : (
                        <span className="text-slate-400">{row.proofLabel}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled
                        title="ฟีเจอร์นี้จะเชื่อมกับ backend ในขั้นถัดไป"
                        className="cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
                      >
                        ยืนยันการทำลายข้อมูล
                      </button>
                    </td>
                  </tr>
                );
              })}

              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    ไม่พบรายการตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
