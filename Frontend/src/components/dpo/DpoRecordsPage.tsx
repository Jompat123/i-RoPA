"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { DataSourceBanner } from "@/components/common/DataSourceBanner";
import {
  rightsRefusalDisplay,
  roleLabelTh,
  securityMeasuresDisplay,
} from "@/lib/dpo/ropa-record-display";
import { NOTO_SANS_THAI_REGULAR_BASE64 } from "@/lib/pdf/noto-sans-thai-base64";
import type { DpoRecordsData } from "@/types/dpo";

type Props = { data: DpoRecordsData };
function ensureThaiPdfFont(doc: jsPDF): boolean {
  try {
    // Register static base64 font on every document instance.
    doc.addFileToVFS("NotoSansThai-Regular.ttf", NOTO_SANS_THAI_REGULAR_BASE64);
    doc.addFont("NotoSansThai-Regular.ttf", "NotoSansThai", "normal", "Identity-H");
    const fontList = doc.getFontList();
    if (!Object.prototype.hasOwnProperty.call(fontList, "NotoSansThai")) return false;
    doc.setFont("NotoSansThai", "normal");
    return true;
  } catch {
    // Fallback to default font instead of crashing export flow.
    return false;
  }
}

export function DpoRecordsPage({
  data,
  canExport = true,
  exportLocked = false,
}: Props & { canExport?: boolean; exportLocked?: boolean }) {
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
        ownerName: row.ownerName || "",
        purpose: row.purpose,
        dataType: row.dataType,
        legalBasis: row.legalBasis,
        retentionPeriod: row.retentionPeriod,
        rights14: rightsRefusalDisplay(row),
        security15: securityMeasuresDisplay(row),
        controllerName: row.role === "controller" ? (row.dataSourceName || "") : "",
        processorName: row.role === "processor" ? (row.processorName || "") : "",
        controllerAddress: row.controllerAddress || "",
        personalDataTypes: row.personalDataTypes.join(", "),
        dataCategory: row.dataCategory || "",
        collectionMethodType:
          row.collectionMethodType === "soft"
            ? "soft file"
            : row.collectionMethodType === "hard"
              ? "hard copy"
              : "",
        sourceDirect: row.collectionSource === "direct" ? "✓" : "",
        sourceOther: row.collectionSource === "other" ? "✓" : "",
        minorUnder10: row.minorConsentUnder10 === true ? "✓" : "",
        minor10to20: row.minorConsent10to20 === true ? "✓" : "",
        crossBorderCountry:
          row.crossBorderTransfer === true ? (row.transferCountry || "มี (ไม่ระบุประเทศ)") : "ไม่มี",
        transferAffiliate:
          row.transferToAffiliate === true ? "มี" : row.transferToAffiliate === false ? "ไม่มี" : "",
        transferMethod: row.transferMethod || "",
        protectionStandard: row.protectionStandard || "",
        legalExemption28: row.legalExemption28 || "",
        storageDataType:
          row.storageDataType === "soft"
            ? "soft file"
            : row.storageDataType === "hard"
              ? "hard copy"
              : "",
        storageMethod: row.storageMethod || "",
        rightsAccessNote: row.rightsAccessNote || "",
        deletionMethod: row.deletionMethod || "",
        disclosureNote: row.disclosureNote || "",
        securityOrg: row.securityOrg || "",
        securityTech: row.securityTech || "",
        securityPhysical: row.securityPhysical || "",
        securityAccessControl: row.securityAccessControl || "",
        securityUserResponsibility: row.securityUserResponsibility || "",
        securityAudit: row.securityAudit || "",
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
    const headerRows = [
      Array(34).fill(""),
      ["", "รายละเอียดของผู้ลงบันทึก ROPA", ...Array(32).fill("")],
      ["", "ชื่อ", ...Array(32).fill("")],
      ["", "ที่อยู่", ...Array(32).fill("")],
      ["", "Email", ...Array(32).fill("")],
      ["", "เบอร์โทร", ...Array(32).fill("")],
      Array(34).fill(""),
      [
        "ลำดับ",
        "บทบาท",
        "ชื่อเจ้าของข้อมูลส่วนบุคคล  (เฉพาะ Controller)",
        "ชื่อผู้ประมวลผลข้อมูลส่วนบุคคล.  (เฉพาะ Processor)",
        "ที่อยู่ผู้ควบคุมข้อมูลส่วนบุคคล     (เฉพาะ Processor)",
        "กิจกรรมประมวลผล",
        "วัตถุประสงค์ของการประมวลผล",
        "ข้อมูลส่วนบุคคลที่จัดเก็บ",
        "หมวดหมู่ของข้อมูล (ข้อมูลลูกค้า/คู่ค้า/ผู้ติดต่อ/พนักงาน) ",
        "ประเภทของข้อมูล (ข้อมูลทั่วไป/ข้อมูลอ่อนไหว) ",
        "วิธีการได้มาซึ่งข้อมูล (soft file/hard copy)",
        "แหล่งที่ได้มาซึ่งข้อมูล",
        "",
        "ฐานในการประมวลผล",
        "การขอความยินยอมของผู้เยาว์ (เฉพาะ Controller)",
        "",
        "ส่งหรือโอนข้อมูลส่วนบุคคลไปยังต่างประเทศ",
        "",
        "",
        "",
        "",
        "นโยบายการเก็บรักษาข้อมูลส่วนบุคคล",
        "",
        "",
        "",
        "",
        "การใช้หรือเปิดเผยข้อมูลส่วนบุคคลที่ได้รับยกเว้นไม่ต้องขอความยินยอม (ระบุให้สอดคล้องฐานในการประมวลผล)           (เฉพาะ Controller)",
        "การปฎิเสธคำขอหรือคำคัดค้านการใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล (*ลงข้อมูลเมื่อมีการปฏิเสธการใช้สิทธิ)                     (เฉพาะ Controller)",
        "คำอธิบายเกี่ยวกับมาตรการรักษาความมั่นคงปลอดภัย",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        ...Array(11).fill(""),
        "จากเจ้าของข้อมูลส่วนบุคคลโดยตรง",
        "จากแหล่งอื่น ",
        "",
        "อายุไม่เกิน 10 ปี ",
        "อายุ 10 - 20 ปี",
        "มีการส่งหรือโอนข้อมูลไปต่างประเทศหรือไม่ (ถ้ามีโปรดระบุประเทศปลายทาง)",
        "เป็นการส่งข้อมูลไปยังต่างประเทศของกลุ่มบริษัทในเครือหรือไม่ (ถ้าใช้โปรดระบุชื่อบริษัท) ",
        "วิธีการโอนข้อมูล",
        "มาตรฐานการคุ้มครองข้อมูลส่วนบุคคลของประเทศปลายทาง",
        "ข้อยกเว้นตามมาตรา 28  ( เช่น ปฏิบัติตามกฎหมาย ความยินยอม ปฏิบัติตามสัญญา ป้องกันอันตรายต่อชีวิต ประโยชน์สาธารณะที่สำคัญ)",
        "ประเภทของข้อมูลที่จัดเก็บ (soft file / hard copy)",
        "วิธีการเก็บรักษาข้อมูล",
        " ระยะเวลาการเก็บรักษาข้อมูลส่วนบุคคล",
        "สิทธิและวิธีการเข้าถึงข้อมูลส่วนบุคคล (ระบุเงื่อนไขการใช้สิทธิและวิธีการ) ",
        "วิธีการลบหรือทำลายข้อมูลส่วนบุคคลเมื่อสิ้นสุดระยะเวลาจัดเก็บ",
        "",
        "",
        "มาตรการเชิงองค์กร",
        "มาตรการเชิงเทคนิค",
        "มาตรการทางกายภาพ",
        "การควบคุมการเข้าถึงข้อมูล",
        "การกำหนดหน้าที่ความรับผิดชอบของผู้ใช้งาน",
        "มาตรการตรวจสอบย้อนหลัง",
      ],
      Array(34).fill(""),
    ];
    const dataRows = exportRows.map((row) => [
      row.order,
      row.roleLabel,
      row.controllerName,
      row.processorName,
      row.controllerAddress,
      row.processName,
      row.purpose,
      row.personalDataTypes,
      row.dataCategory,
      row.dataType,
      row.collectionMethodType,
      row.sourceDirect,
      row.sourceOther,
      row.legalBasis,
      row.minorUnder10,
      row.minor10to20,
      row.crossBorderCountry,
      row.transferAffiliate,
      row.transferMethod,
      row.protectionStandard,
      row.legalExemption28,
      row.storageDataType,
      row.storageMethod,
      row.retentionPeriod,
      row.rightsAccessNote,
      row.deletionMethod,
      row.disclosureNote,
      row.rights14,
      row.securityOrg,
      row.securityTech,
      row.securityPhysical,
      row.securityAccessControl,
      row.securityUserResponsibility,
      row.securityAudit,
    ]);
    const tableRows = dataRows.length > 0 ? dataRows : [["1", "", "ไม่มีข้อมูล", ...Array(31).fill("")]];

    void (async () => {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("ตาราง Ropa รวม Controller + Pro");

      [...headerRows, ...tableRows].forEach((row) => worksheet.addRow(row));

      const colWidths = [
        13.8516, 65.5, 65.5, 76, 77.1719, 77.1719, 77.1719, 90.5, 56.1719, 52.5, 99.5, 40.8516,
        27, 85.5, 83, 84.8516, 39.1719, 41, 32.8516, 33.5, 58.5, 40.5, 55.5, 31.5, 81.5, 41.5,
        113.352, 125, 23.6719, 24.8516, 26.3516, 48.5, 60, 84.8516,
      ];
      colWidths.forEach((w, idx) => {
        worksheet.getColumn(idx + 1).width = w;
      });

      [
        "C8:C10", "O9:O10", "P9:P10", "Q8:U8", "Q9:Q10", "R9:R10", "S9:S10", "T9:T10", "U9:U10",
        "A8:A10", "G8:G10", "H8:H10", "M9:M10", "L9:L10", "C7:AB7", "I8:I10", "J8:J10", "W9:W10",
        "V9:V10", "V8:Z8", "K8:K10", "X9:X10", "L8:M8", "Y9:Y10", "Z9:Z10", "N8:N10", "O8:P8",
        "AH9:AH10", "AC9:AC10", "AD9:AD10", "AE9:AE10", "AF9:AF10", "AG9:AG10", "AC8:AH8",
        "AB8:AB10", "AA8:AA10", "D8:D10", "B8:B10", "E8:E10", "F8:F10", "E2:G2", "B2:D2",
        "F3:G3", "C3:D3", "F4:G4", "C4:D4", "F5:G5", "C5:D5", "F6:G6", "C6:D6",
      ].forEach((m) => worksheet.mergeCells(m));

      for (let row = 8; row <= 10; row += 1) {
        for (let col = 1; col <= 34; col += 1) {
          const cell = worksheet.getCell(row, col);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFD9D9D9" },
          };
          cell.font = { name: "Calibri", size: 11 };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          cell.border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        }
      }

      for (let row = 11; row <= 10 + tableRows.length; row += 1) {
        for (let col = 1; col <= 34; col += 1) {
          const cell = worksheet.getCell(row, col);
          cell.font = { name: "Calibri", size: 11 };
          cell.alignment = { vertical: "middle", horizontal: col === 1 ? "center" : "left", wrapText: true };
          cell.border = {
            top: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          };
        }
      }

      [2, 3, 4, 5, 6].forEach((row) => {
        worksheet.getRow(row).font = { name: "Calibri", size: 11 };
      });
      worksheet.getRow(7).height = 8;
      worksheet.getRow(8).height = 42;
      worksheet.getRow(9).height = 52;
      worksheet.getRow(10).height = 8;

      if (exportLocked) {
        await worksheet.protect("iropa-readonly", {
          selectLockedCells: true,
          selectUnlockedCells: true,
          formatCells: false,
          formatColumns: false,
          formatRows: false,
          insertColumns: false,
          insertRows: false,
          insertHyperlinks: false,
          deleteColumns: false,
          deleteRows: false,
          sort: false,
          autoFilter: false,
          pivotTables: false,
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ตาราง Ropa รวม Controller + Processor ${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })();
  }

  function onExportPdf() {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    void (async () => {
      const hasThaiFont = ensureThaiPdfFont(doc);
      const pdfFont = hasThaiFont ? "NotoSansThai" : "helvetica";
      doc.setFont(pdfFont, "normal");
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
        styles: { font: pdfFont, fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        headStyles: { font: pdfFont, fillColor: [241, 245, 249], textColor: [15, 23, 42] },
        head: [[
          "ลำดับ",
          "บทบาท",
          "กิจกรรมประมวลผล",
          "แผนก/ผู้รับผิดชอบ",
          "วัตถุประสงค์",
          "ประเภทข้อมูล",
          "ฐานกฎหมาย",
          "ระยะเวลาจัดเก็บ",
          "โอนต่างประเทศ",
          "วิธีเก็บรักษา",
          "ข้อ 14",
          "ข้อ 15",
        ]],
        body:
          exportRows.length > 0
            ? exportRows.map((row) => [
                row.order,
                row.roleLabel,
                row.processName,
                `${row.department}${row.ownerName ? ` / ${row.ownerName}` : ""}`,
                row.purpose,
                row.dataType,
                row.legalBasis,
                row.crossBorderCountry,
                row.storageMethod,
                row.retentionPeriod,
                row.rights14,
                row.security15,
              ])
            : [[
                "-",
                "-",
                "ไม่พบข้อมูลตามตัวกรอง",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
              ]],
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 48 },
          2: { cellWidth: 78 },
          3: { cellWidth: 90 },
          4: { cellWidth: 78 },
          5: { cellWidth: 52 },
          6: { cellWidth: 64 },
          7: { cellWidth: 54 },
          8: { cellWidth: 62 },
          9: { cellWidth: 62 },
          10: { cellWidth: 76 },
          11: { cellWidth: 76 },
        },
      });

      doc.save(`dpo-records-${new Date().toISOString().slice(0, 10)}.pdf`);
    })();
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
          {canExport ? (
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
          ) : (
            <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
              Auditor: สิทธิ์ดูข้อมูลอย่างเดียว
            </span>
          )}
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
          <table className="w-full min-w-[1600px] text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3">ลำดับ</th>
                <th className="px-5 py-3">บทบาท</th>
                <th className="px-5 py-3">กิจกรรมประมวลผล</th>
                <th className="px-5 py-3">วัตถุประสงค์</th>
                <th className="px-5 py-3">ข้อมูลส่วนบุคคลที่จัดเก็บ</th>
                <th className="px-5 py-3">หมวดหมู่/ประเภท</th>
                <th className="px-5 py-3">แหล่งที่มา</th>
                <th className="px-5 py-3">ฐานในการประมวลผล</th>
                <th className="px-5 py-3">ส่ง/โอนต่างประเทศ</th>
                <th className="px-5 py-3">ระยะเวลาการเก็บรักษา</th>
                <th className="px-5 py-3">วิธีเก็บรักษา</th>
                <th className="px-5 py-3">ผลการพิจารณาคำขอใช้สิทธิ</th>
                <th className="px-5 py-3">มาตรการความปลอดภัย</th>
              </tr>
            </thead>
            <tbody>
              {exportRows.map((row) => (
                <tr key={`${row.order}-${row.processName}`} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{row.order}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.roleLabel.includes("ผู้ควบคุม")
                          ? "bg-sky-100 text-sky-900"
                          : "bg-amber-100 text-amber-950"
                      }`}
                    >
                      {row.roleLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{row.processName}</td>
                  <td className="px-5 py-3 text-slate-700">{row.purpose}</td>
                  <td className="px-5 py-3 text-slate-700">{row.personalDataTypes || "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{`${row.dataCategory || "-"} / ${row.dataType}`}</td>
                  <td className="px-5 py-3 text-slate-700">
                    {row.sourceDirect ? "จากเจ้าของข้อมูลโดยตรง" : row.sourceOther ? "จากแหล่งอื่น" : "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-700">{row.legalBasis}</td>
                  <td className="px-5 py-3 text-slate-700">{row.crossBorderCountry || "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{row.retentionPeriod}</td>
                  <td className="px-5 py-3 text-slate-700">{row.storageMethod || "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{row.rights14 || "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{row.security15 || "-"}</td>
                </tr>
              ))}
              {exportRows.length === 0 ? (
                <tr className="border-t border-slate-100">
                  <td colSpan={13} className="px-5 py-6 text-center text-slate-500">
                    ไม่มีข้อมูล
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
