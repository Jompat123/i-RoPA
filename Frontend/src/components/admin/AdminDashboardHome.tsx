import { DataSourceBanner } from "@/components/common/DataSourceBanner";
import type { AdminDashboardData, AdminUserRole } from "@/types/admin";

type Props = { data: AdminDashboardData };

function roleLabel(role: AdminUserRole): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "DPO":
      return "DPO";
    default:
      return "Data Owner";
  }
}

export function AdminDashboardHome({ data }: Props) {
  const chartColors = ["#3b82f6", "#22c55e", "#06b6d4", "#f59e0b", "#8b5cf6", "#ef4444"];
  const totalWorkload = data.departmentWorkload.reduce((sum, item) => sum + item.count, 0) || 1;
  const conic = data.departmentWorkload
    .map((item, index, arr) => {
      const start =
        arr.slice(0, index).reduce((sum, curr) => sum + curr.count, 0) / totalWorkload;
      const end = (arr.slice(0, index + 1).reduce((sum, curr) => sum + curr.count, 0) / totalWorkload);
      const color = chartColors[index % chartColors.length];
      return `${color} ${Math.round(start * 360)}deg ${Math.round(end * 360)}deg`;
    })
    .join(", ");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <DataSourceBanner source={data.source} loadError={data.loadError ?? null} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          {
            title: "ผู้ใช้งานทั้งหมด",
            value: data.totalUsers.toLocaleString("en-US"),
            gradient: "from-[#3b82f6] to-[#2563eb]",
          },
          {
            title: "แผนกทั้งหมด",
            value: data.totalDepartments.toLocaleString("en-US"),
            gradient: "from-[#22d3ee] to-[#06b6d4]",
          },
          {
            title: "จำนวน ROPA รวม",
            value: data.totalRopa.toLocaleString("en-US"),
            gradient: "from-[#fb923c] to-[#f97316]",
          },
          {
            title: "สถานะระบบ",
            value: data.systemOnline ? "Online" : "Offline",
            gradient: "from-[#34d399] to-[#10b981]",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-sm ${card.gradient}`}
          >
            <p className="text-xs text-white/85">{card.title}</p>
            <p className="mt-2 text-4xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="grid grid-cols-1 gap-4">
          <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-800">
              จัดการผู้ใช้งานล่าสุด
            </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="text-left text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3">ชื่อ</th>
                    <th className="px-5 py-3">บทบาท</th>
                    <th className="px-5 py-3">แผนก</th>
                    <th className="px-5 py-3">สถานะ</th>
                  </tr>
                </thead>
              </table>
            </div>
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full min-w-[680px] text-sm">
              <tbody>
                {data.latestUsers.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-slate-700">{row.name}</td>
                    <td className="px-5 py-3 text-slate-700">{roleLabel(row.role)}</td>
                    <td className="px-5 py-3 text-slate-700">{row.department}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          row.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {row.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">อัตราการทำงาน (แผนก)</h2>
            <div className="mt-4 flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div
                className="relative h-52 w-52 rounded-full"
                style={{ background: `conic-gradient(${conic || "#e2e8f0 0deg 360deg"})` }}
              >
                <div className="absolute inset-8 rounded-full bg-white" />
              </div>
              <ul className="grid w-full grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {data.departmentWorkload.map((item, index) => (
                  <li key={item.department} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <span className="inline-flex items-center gap-2 text-slate-700">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      />
                      {item.department}
                    </span>
                    <span className="font-semibold text-slate-900">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">บันทึกประวัติการใช้งานล่าสุด</h2>
          <p className="mt-1 text-xs text-slate-500">ดึงจาก backend (สูงสุด 20 รายการล่าสุด)</p>
          <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
            {data.recentLogs.length === 0 ? (
              <p className="text-sm text-slate-500">ยังไม่มีบันทึกการใช้งานล่าสุด</p>
            ) : (
              <ul className="space-y-3 text-sm text-slate-600">
                {data.recentLogs.map((log, index) => (
                  <li key={index} className="border-b border-slate-100 pb-3 last:border-0">
                    {log}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
