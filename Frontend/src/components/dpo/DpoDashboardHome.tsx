import Link from "next/link";

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

  const defaultLegal = [
    { key: "consent", label: "Consent", count: 1 },
    { key: "contract", label: "Contract", count: 1 },
    { key: "legitimate_interest", label: "Legitimate Interest", count: 1 },
    { key: "legal_obligation", label: "Legal Obligation", count: 1 },
  ];
  const legalDistribution = (data.legalBasisDistribution.length ? data.legalBasisDistribution : defaultLegal).map(
    (item, index) => ({
      ...item,
      value: item.count,
      color: ["#3b82f6", "#22c55e", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444"][index % 6],
    }),
  );
  const total = legalDistribution.reduce((sum, item) => sum + item.value, 0) || 1;
  const legalWithPercent = legalDistribution.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
  }));
  const radius = 70;
  const strokeWidth = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
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
          <h2 className="text-2xl font-semibold text-slate-800">การกระจายฐานทางกฎหมาย</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
            {legalWithPercent.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label} ({item.percent}%)
              </span>
            ))}
          </div>
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
                ทั้งหมด
              </text>
              <text x="100" y="112" textAnchor="middle" className="fill-slate-800 text-[15px] font-semibold">
                {total}
              </text>
            </svg>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">บันทึกกิจกรรมล่าสุด</h2>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              data.source === "api" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {data.source === "api" ? "ข้อมูลจริง" : "Mock"}
          </span>
        </div>
        <div className="h-56 overflow-y-scroll px-5 py-3 text-sm text-slate-600">
          {data.recentLogs.map((log, index) => (
            <p key={index} className="border-b border-slate-100 py-2 last:border-0">
              {log}
            </p>
          ))}
          {data.recentLogs.length === 0 ? <p>ยังไม่มีบันทึกกิจกรรม</p> : null}
        </div>
      </section>
    </div>
  );
}
