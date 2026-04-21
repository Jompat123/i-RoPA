"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { DataSourceBanner } from "@/components/common/DataSourceBanner";
import {
  rightsRefusalDisplay,
  roleLabelTh,
  securityMeasuresDisplay,
} from "@/lib/dpo/ropa-record-display";
import type { DpoRecordsData } from "@/types/dpo";

type Props = { data: DpoRecordsData };

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
  const activeFilters = useMemo(
    () =>
      [
        data.filters.department ? `Department=${data.filters.department}` : null,
        data.filters.dataType ? `DataType=${data.filters.dataType}` : null,
        data.filters.legalBasis ? `LegalBasis=${data.filters.legalBasis}` : null,
      ]
        .filter(Boolean)
        .join(", "),
    [data.filters.department, data.filters.dataType, data.filters.legalBasis],
  );

  function onExportExcel() {
    const exportedAt = new Date().toLocaleString("th-TH");
    const headerRow = [
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
    const dataRows = exportRows.map((row) => [
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
    ]);
    const tableRows =
      dataRows.length > 0
        ? dataRows
        : [["-", "-", "ไม่มีข้อมูลสำหรับเงื่อนไขที่เลือก", "-", "-", "-", "-", "-", "-", "-"]];

    const worksheet = XLSX.utils.aoa_to_sheet([
      ["ทะเบียนบันทึก ROPA ทั้งองค์กร (DPO)"],
      [`Exported at ${exportedAt}`],
      [`Records: ${exportRows.length}`],
      [`Filters: ${activeFilters || "All"}`],
      [
        "ข้อ 14-15: แถวผู้ประมวลผล (Processor) แสดงข้อความไม่เกี่ยวข้องตามแบบฟอร์มที่ไม่มีช่องกรอกสำหรับบทบาทนี้",
      ],
      [],
      headerRow,
      ...tableRows,
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DPO Records");
    XLSX.writeFile(workbook, `dpo-records-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function onExportPdf() {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const exportedAt = new Date().toLocaleString("th-TH");
    doc.setFontSize(14);
    doc.text("DPO Records", 40, 34);
    doc.setFontSize(10);
    doc.text(`Exported at ${exportedAt}`, 40, 52);
    doc.text(`Records: ${exportRows.length}`, 40, 66);
    doc.text(`Filters: ${activeFilters || "All"}`, 40, 80);
    doc.text(
      "Columns 14-15: Processor rows are marked as not applicable for this form.",
      40,
      94,
    );

    autoTable(doc, {
      startY: 106,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
      head: [[
        "No.",
        "Role",
        "Process",
        "Department/Owner",
        "Purpose",
        "Data Type",
        "Legal Basis",
        "Retention",
        "Section 14",
        "Section 15",
      ]],
      body:
        exportRows.length > 0
          ? exportRows.map((row) => [
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
            ])
          : [["-", "-", "No records for selected filters", "-", "-", "-", "-", "-", "-", "-"]],
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 65 },
        2: { cellWidth: 95 },
        3: { cellWidth: 80 },
        4: { cellWidth: 90 },
        5: { cellWidth: 75 },
        6: { cellWidth: 75 },
        7: { cellWidth: 55 },
        8: { cellWidth: 95 },
        9: { cellWidth: 95 },
      },
    });

    doc.save(`dpo-records-${new Date().toISOString().slice(0, 10)}.pdf`);
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
