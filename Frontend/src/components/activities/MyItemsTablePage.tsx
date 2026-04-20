import Link from "next/link";
import { Eye, Pencil, Search } from "lucide-react";

import { DataSourceBanner } from "@/components/common/DataSourceBanner";
import type { ItemStatus, MyItemsPageData } from "@/types/records";

type Props = {
  data: MyItemsPageData;
  justSaved?: boolean;
};

function statusPill(status: ItemStatus): { label: string; className: string } {
  switch (status) {
    case "draft":
      return { label: "ฉบับร่าง", className: "bg-slate-500 text-white" };
    case "approved":
      return { label: "อนุมัติแล้ว", className: "bg-emerald-500 text-white" };
    case "pending":
      return { label: "รอการอนุมัติ", className: "bg-amber-400 text-slate-900" };
    case "needs_fix":
      return { label: "ต้องแก้ไข", className: "bg-rose-500 text-white" };
    default:
      return { label: "-", className: "bg-slate-300 text-slate-700" };
  }
}

export function MyItemsTablePage({ data, justSaved = false }: Props) {
  const { rows, stats, departments, filters, source, loadError } = data;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DataSourceBanner source={source} loadError={loadError ?? null} />
      {justSaved ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          บันทึกฉบับร่างสำเร็จแล้ว และเพิ่มรายการในตารางเรียบร้อย
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">รายการของฉัน</h1>
        <form className="flex flex-wrap items-center gap-3" method="GET">
          <label className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="ค้นหารายการ..."
              className="h-10 w-48 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 md:w-64"
            />
          </label>
          <select
            name="status"
            defaultValue={filters.status}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">สถานะ</option>
            <option value="draft">ฉบับร่าง</option>
            <option value="pending">รอการอนุมัติ</option>
            <option value="needs_fix">ต้องแก้ไข</option>
            <option value="approved">อนุมัติแล้ว</option>
          </select>
          <select
            name="department"
            defaultValue={filters.department}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">แผนก</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-10 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
          >
            ค้นหา
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "รายการทั้งหมด", value: stats.total, color: "text-cyan-600 bg-cyan-50" },
          { label: "ฉบับร่าง", value: stats.draft, color: "text-slate-600 bg-slate-100" },
          { label: "รอการอนุมัติ", value: stats.pending, color: "text-amber-600 bg-amber-50" },
          { label: "ต้องแก้ไข", value: stats.needsFix, color: "text-rose-600 bg-rose-50" },
          { label: "อนุมัติแล้ว", value: stats.approved, color: "text-emerald-600 bg-emerald-50" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                ●
              </span>
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-3xl font-bold text-slate-800">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">ลำดับ</th>
                <th className="px-4 py-3">รหัสรายการ</th>
                <th className="px-4 py-3">ชื่อกิจกรรม</th>
                <th className="px-4 py-3">วันที่แก้ไขล่าสุด</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {rows.map((row, idx) => {
                const pill = statusPill(row.status);
                const order = idx + 1;
                return (
                  <tr key={row.id} className="border-t border-slate-100 text-slate-700">
                    <td className="px-4 py-3">{order}</td>
                    <td className="px-4 py-3 font-medium">{row.code}</td>
                    <td className="px-4 py-3">{row.activityName}</td>
                    <td className="px-4 py-3">{row.updatedAtLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pill.className}`}>
                        {pill.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 text-slate-500">
                        <Link
                          href={`/reports?id=${row.id}`}
                          className="rounded-md p-1.5 hover:bg-slate-100"
                          aria-label="ดูรายละเอียด"
                        >
                          <Eye className="h-4 w-4" aria-hidden />
                        </Link>
                        <Link
                          href={`/reports?id=${row.id}${row.status === "needs_fix" ? "&from=needs_fix" : ""}`}
                          className="rounded-md p-1.5 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
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
