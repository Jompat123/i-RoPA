import Link from "next/link";

import { DataSourceBanner } from "@/components/common/DataSourceBanner";
import type { DpoDashboardData } from "@/types/dpo";

type Props = { data: DpoDashboardData };

export function DpoDashboardHome({ data }: Props) {
  const byDepartment = data.departmentStatus.length
    ? data.departmentStatus.map((x) => ({
        dep: x.department,
        approved: x.approved,
        pending: x.pending,
        needsFix: x.needsFix,
      }))
    : [
        { dep: "HR", approved: 0, pending: 0, needsFix: 0 },
        { dep: "Marketing", approved: 0, pending: 0, needsFix: 0 },
        { dep: "IT", approved: 0, pending: 0, needsFix: 0 },
        { dep: "Finance", approved: 0, pending: 0, needsFix: 0 },
      ];
  const maxCount = Math.max(1, ...byDepartment.flatMap((x) => [x.approved, x.pending, x.needsFix]));

  const legalDistribution = data.legalBasisDistribution.map((item, index) => ({
    ...item,
    value: item.count,
    color: ["#3b82f6", "#22c55e", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444"][index % 6],
  }));
  const totalSensitive = legalDistribution.reduce((sum, item) => sum + item.value, 0);
  const total = totalSensitive || 1;
  const legalWithPercent = legalDistribution.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
  }));
  const radius = 70;
  const strokeWidth = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <DataSourceBanner source={data.source} loadError={data.loadError ?? null} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            title: "รอตรวจสอบครั้งแรก (New)",
            value: data.workflow.newPending,
            gradient: "from-[#4f8df3] to-[#3f7de0]",
            footer: "รอตรวจสอบครั้งแรก",
          },
          {
            title: "รอตรวจสอบซ้ำ (Update)",
            value: data.workflow.updatePending,
            gradient: "from-[#21a9e1] to-[#1b98ce]",
            footer: "ตรวจสอบซ้ำ",
          },
          {
            title: "รอดำเนินการแก้ไข",
            value: data.workflow.revisionRequired,
            gradient: "from-[#f6ae08] to-[#ef9b00]",
            footer: "Revision Required",
          },
          {
            title: "แจ้งเตือนครบกำหนด",
            value: data.workflow.alertCount,
            gradient: "from-[#32c96a] to-[#24bb5b]",
            footer: "Alerts",
          },
        ].map((item) => (
          <div
            key={item.title}
            className={`overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-sm ${item.gradient}`}
          >
            <p className="text-xs text-white/90">{item.title}</p>
            <p className="mt-2 text-5xl font-bold leading-none">{item.value.toLocaleString("en-US")}</p>
            <div className="mt-4 -mx-5 -mb-5 bg-black/10 px-5 py-2 text-xs text-white/90">{item.footer}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-800">สถานะ ROPA ตามแผนก</h2>
          <div className="mt-6 grid grid-cols-4 gap-4 text-xs text-slate-500">
            {byDepartment.map((row) => (
              <div key={row.dep} className="space-y-2 text-center">
                <div className="mx-auto flex h-44 w-12 items-end justify-center gap-1">
                  {[
                    { value: row.approved, color: "bg-blue-500" },
                    { value: row.pending, color: "bg-cyan-500" },
                    { value: row.needsFix, color: "bg-amber-500" },
                  ].map((bar, idx) => (
                    <span
                      key={idx}
                      className={`inline-block w-2 rounded-t ${bar.color}`}
                      style={{ height: `${Math.max((bar.value / maxCount) * 100, 8)}%` }}
                    />
                  ))}
                </div>
                <div className="font-medium text-slate-700">{row.dep}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Link href="/dpo/reviews" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              ดูรายการรอตรวจทั้งหมด
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-800">สัดส่วนข้อมูลอ่อนไหวรายแผนก</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
            {legalWithPercent.length > 0 ? (
              legalWithPercent.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label} ({item.percent}%)
                </span>
              ))
            ) : (
              <span>ยังไม่มีรายการข้อมูลอ่อนไหว</span>
            )}
          </div>
          {legalWithPercent.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">แผนก</th>
                    <th className="px-3 py-2 text-right font-semibold">จำนวนรายการ</th>
                    <th className="px-3 py-2 text-right font-semibold">สัดส่วน</th>
                  </tr>
                </thead>
                <tbody>
                  {legalWithPercent.map((item) => (
                    <tr key={`row-${item.key}`} className="border-t border-slate-100 text-slate-700">
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{item.value}</td>
                      <td className="px-3 py-2 text-right">{item.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <div className="mt-6 flex justify-center">
            <svg viewBox="0 0 200 200" className="h-64 w-64">
              <circle cx="100" cy="100" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
              {legalDistribution.map((item, index) => {
                const prevTotal = legalDistribution
                  .slice(0, index)
                  .reduce((sum, current) => sum + current.value, 0);
                const length = (item.value / total) * circumference;
                const offset = circumference - (prevTotal / total) * circumference;

                return (
                  <circle
                    key={item.key}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${length} ${circumference}`}
                    strokeDashoffset={offset}
                    transform="rotate(-90 100 100)"
                  />
                );
              })}
              <circle cx="100" cy="100" r="42" fill="white" />
              <text x="100" y="94" textAnchor="middle" className="fill-slate-500 text-[10px]">
                รายการอ่อนไหว
              </text>
              <text x="100" y="112" textAnchor="middle" className="fill-slate-800 text-[15px] font-semibold">
                {totalSensitive}
              </text>
            </svg>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">บันทึกกิจกรรมล่าสุด</h2>
          <p className="mt-1 text-xs text-slate-500">รอ endpoint audit log จาก backend</p>
        </div>
        <div className="h-56 overflow-y-scroll px-5 py-3 text-sm text-slate-600">
          {data.recentLogs.length === 0 ? (
            <p className="py-2 text-slate-500">ยังไม่มีบันทึกกิจกรรม</p>
          ) : (
            data.recentLogs.map((log, index) => (
              <p key={index} className="border-b border-slate-100 py-2 last:border-0">
                {log}
              </p>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
