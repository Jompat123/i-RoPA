import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FilePlus2,
  TrendingUp,
  Upload,
} from "lucide-react";
import Link from "next/link";

import { type ActivityStatus, type SummaryCardType } from "@/data/dashboard-mock";
import type { DashboardPageData } from "@/lib/data/get-dashboard-page-data";

function cardGradient(type: SummaryCardType): string {
  switch (type) {
    case "total":
      return "from-[#3b82f6] to-[#2563eb]";
    case "pending":
      return "from-[#22d3ee] to-[#06b6d4]";
    case "edit":
      return "from-[#fb923c] to-[#f97316]";
    case "approved":
      return "from-[#34d399] to-[#10b981]";
    default:
      return "from-slate-400 to-slate-500";
  }
}

function SummaryCardGlyph({ type }: { type: SummaryCardType }) {
  const cls = "h-6 w-6 text-white";
  switch (type) {
    case "total":
      return <TrendingUp className={cls} strokeWidth={2} aria-hidden />;
    case "pending":
      return <Clock className={cls} strokeWidth={2} aria-hidden />;
    case "edit":
      return <AlertTriangle className={cls} strokeWidth={2} aria-hidden />;
    case "approved":
      return <CheckCircle2 className={cls} strokeWidth={2} aria-hidden />;
    default:
      return null;
  }
}

function statusBadge(status: ActivityStatus): { label: string; className: string } {
  switch (status) {
    case "edit":
      return { label: "ต้องแก้ไข", className: "bg-orange-500 text-white" };
    case "pending":
      return { label: "รอการอนุมัติ", className: "bg-sky-500 text-white" };
    case "approved":
      return { label: "อนุมัติแล้ว", className: "bg-emerald-500 text-white" };
    default:
      return { label: "ไม่ทราบสถานะ", className: "bg-slate-400 text-white" };
  }
}

type DashboardHomeProps = {
  data: DashboardPageData;
};

export function DashboardHome({ data }: DashboardHomeProps) {
  const { summaryCards, taskList, recentActivities } = data;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.id}
            className={`flex flex-col rounded-2xl bg-gradient-to-br p-6 text-white shadow-sm ${cardGradient(card.type)}`}
          >
            <h2 className="text-base font-medium opacity-95">{card.title}</h2>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-4xl font-bold tabular-nums">{card.count}</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                <SummaryCardGlyph type={card.type} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              การดำเนินการด่วน
            </h2>
            <div className="flex flex-col gap-3">
              <Link
                href="/reports"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0057cc] px-4 py-3 font-medium text-white transition hover:bg-blue-800"
              >
                <FilePlus2 className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                สร้างบันทึก ROPA ใหม่
              </Link>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#22a345] px-4 py-3 font-medium text-white transition hover:bg-green-700"
              >
                <Upload className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                อัปโหลด Excel ใหม่
              </button>
            </div>
          </section>

          <section className="flex flex-1 flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              รายการงาน
            </h2>
            <ul className="flex flex-col gap-4">
              {taskList.map((task, index) => (
                <li
                  key={index}
                  className="border-b border-slate-100 pb-4 text-sm text-slate-700 last:border-0 last:pb-0"
                >
                  {task}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-6 text-lg font-semibold text-slate-800">
            กิจกรรมล่าสุด
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 text-sm font-semibold text-slate-600">
                  <th className="pb-4 pl-2 pr-2 font-medium">ชื่อ ROPA</th>
                  <th className="pb-4 pl-2 pr-2 font-medium">แผนก</th>
                  <th className="pb-4 pl-2 pr-2 font-medium">วันที่</th>
                  <th className="pb-4 pl-2 pr-2 text-right font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {recentActivities.map((row) => {
                  const { label, className: badgeClass } = statusBadge(row.status);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-slate-50 transition last:border-0 hover:bg-slate-50/80"
                    >
                      <td className="py-4 pl-2 pr-2">{row.name}</td>
                      <td className="py-4 pl-2 pr-2">{row.department}</td>
                      <td className="py-4 pl-2 pr-2 tabular-nums">{row.date}</td>
                      <td className="py-4 pl-2 pr-2 text-right">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}
                        >
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
