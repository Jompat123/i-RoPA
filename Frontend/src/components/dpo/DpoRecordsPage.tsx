"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { DataSourceBanner } from "@/components/common/DataSourceBanner";
import {
  rightsRefusalDisplay,
  roleLabelTh,
  securityMeasuresDisplay,
} from "@/lib/dpo/ropa-record-display";
import type { DpoRecordsData } from "@/types/dpo";

type Props = { data: DpoRecordsData };

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function DpoRecordsPage({ data }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const exportRows = useMemo(
    () =>
      data.rows.map((row, idx) => ({
        order: idx + 1,
        roleLabel: roleLabelTh(row.role),
        processName: row.processName,
        department: row.department,
        purpose: row.purpose,
        dataType: row.dataType,
        legalBasis: row.legalBasis,
        retentionPeriod: row.retentionPeriod,
        rights14: rightsRefusalDisplay(row),
        security15: securityMeasuresDisplay(row),
      })),
    [data.rows],
  );

  function escapeCsv(value: string): string {
    const v = String(value ?? "");
    if (v.includes('"') || v.includes(",") || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  }

  function onExportExcel() {
    const header = [
      "ลำดับ",
      "บทบาท (Controller/Processor)",
      "ชื่อกิจกรรม",
      "แผนก/เจ้าของข้อมูล",
      "วัตถุประสงค์",
      "ประเภทข้อมูลส่วนบุคคล",
      "ฐานทางกฎหมาย",
      "ระยะเวลาจัดเก็บ",
      "ข้อ 14 การปฏิเสธคำขอใช้สิทธิ",
      "ข้อ 15 มาตรการรักษาความมั่นคงปลอดภัย",
    ];
    const rows = exportRows.map((row) =>
      [
        row.order,
        row.roleLabel,
        row.processName,
        row.department,
        row.purpose,
        row.dataType,
        row.legalBasis,
        row.retentionPeriod,
        row.rights14,
        row.security15,
      ]
        .map((x) => escapeCsv(String(x)))
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dpo-records-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onExportPdf() {
    const opened = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");
    if (!opened) return;
    const rowsHtml = exportRows
      .map(
        (row) => `
          <tr>
            <td>${row.order}</td>
            <td>${escapeHtml(row.roleLabel)}</td>
            <td>${escapeHtml(row.processName)}</td>
            <td>${escapeHtml(row.department)}</td>
            <td>${escapeHtml(row.purpose)}</td>
            <td>${escapeHtml(row.dataType)}</td>
            <td>${escapeHtml(row.legalBasis)}</td>
            <td>${escapeHtml(row.retentionPeriod)}</td>
            <td>${escapeHtml(row.rights14)}</td>
            <td>${escapeHtml(row.security15)}</td>
          </tr>
        `,
      )
      .join("");
    opened.document.write(`
      <html>
        <head>
          <title>DPO Records Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #0f172a; }
            h1 { margin: 0 0 8px; font-size: 20px; }
            p { margin: 0 0 14px; color: #334155; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; vertical-align: top; }
            th { background: #f1f5f9; }
            @media print { button { display:none; } }
          </style>
        </head>
        <body>
          <h1>ทะเบียนบันทึก ROPA ทั้งองค์กร (DPO)</h1>
          <p>Exported at ${new Date().toLocaleString("th-TH")}</p>
          <p style="font-size:11px;color:#64748b">ข้อ 14–15: แถวผู้ประมวลผล (Processor) แสดงข้อความ &quot;ไม่เกี่ยวข้อง&quot; ตามแบบฟอร์มที่ไม่มีช่องกรอกสำหรับบทบาทนี้</p>
          <table>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>บทบาท</th>
                <th>ชื่อกิจกรรม</th>
                <th>แผนก/เจ้าของข้อมูล</th>
                <th>วัตถุประสงค์</th>
                <th>ประเภทข้อมูลส่วนบุคคล</th>
                <th>ฐานทางกฎหมาย</th>
                <th>ระยะเวลาจัดเก็บ</th>
                <th>ข้อ 14</th>
                <th>ข้อ 15</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    opened.document.close();
  }

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
      <DataSourceBanner source={data.source} loadError={data.loadError ?? null} />
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-semibold text-slate-800">ทะเบียนบันทึก ROPA ทั้งองค์กร</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onExportPdf}
              className="rounded-xl bg-rose-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-rose-400"
            >
              Export PDF (รายงานทางการ)
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              className="rounded-xl bg-emerald-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-emerald-300"
            >
              Export Excel (เพื่อตรวจสอบ)
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          คอลัมน์ข้อ 14–15: รายการที่เป็น <span className="font-semibold">ผู้ประมวลผล (Processor)</span>{" "}
          จะแสดงข้อความว่าไม่เกี่ยวข้องตามแบบฟอร์ม (ไม่มีช่องกรอกสำหรับบทบาทนี้) — Controller แสดงข้อมูลที่กรอกจริง
        </p>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">ตัวกรองข้อมูล</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            value={data.filters.department}
            onChange={(event) => setFilters({ department: event.target.value })}
          >
            <option value="">Department</option>
            {data.departments.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            value={data.filters.dataType}
            onChange={(event) => setFilters({ dataType: event.target.value })}
          >
            <option value="">Data Type</option>
            {data.dataTypes.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            value={data.filters.legalBasis}
            onChange={(event) => setFilters({ legalBasis: event.target.value })}
          >
            <option value="">Lawful Basis</option>
            {data.legalBases.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold text-slate-800">
          รายการกิจกรรมที่ตรวจสอบเสร็จสมบูรณ์
        </h2>
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full min-w-[1280px] text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3">ลำดับ</th>
                <th className="px-5 py-3">บทบาท</th>
                <th className="px-5 py-3">ชื่อกิจกรรม</th>
                <th className="px-5 py-3">แผนก/เจ้าของข้อมูล</th>
                <th className="px-5 py-3">วัตถุประสงค์</th>
                <th className="px-5 py-3">ประเภทข้อมูลส่วนบุคคล</th>
                <th className="px-5 py-3">ฐานทางกฎหมาย</th>
                <th className="px-5 py-3">ระยะเวลาจัดเก็บ</th>
                <th className="max-w-[200px] px-5 py-3">ข้อ 14 ปฏิเสธสิทธิ</th>
                <th className="max-w-[220px] px-5 py-3">ข้อ 15 มาตรการความปลอดภัย</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, idx) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{idx + 1}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.role === "controller"
                          ? "bg-sky-100 text-sky-900"
                          : "bg-amber-100 text-amber-950"
                      }`}
                    >
                      {row.role === "controller" ? "Controller" : "Processor"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{row.processName}</td>
                  <td className="px-5 py-3 text-slate-700">{row.department}</td>
                  <td className="px-5 py-3 text-slate-700">{row.purpose}</td>
                  <td className="px-5 py-3 text-slate-700">{row.dataType}</td>
                  <td className="px-5 py-3 text-slate-700">{row.legalBasis}</td>
                  <td className="px-5 py-3 text-slate-700">{row.retentionPeriod}</td>
                  <td className="max-w-[200px] px-5 py-3 text-xs leading-relaxed text-slate-600">
                    {rightsRefusalDisplay(row)}
                  </td>
                  <td className="max-w-[220px] px-5 py-3 text-xs leading-relaxed text-slate-600">
                    {securityMeasuresDisplay(row)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
