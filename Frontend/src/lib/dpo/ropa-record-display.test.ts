import { describe, expect, it } from "vitest";

import {
  rightsRefusalDisplay,
  roleLabelTh,
  securityMeasuresDisplay,
} from "./ropa-record-display";
import type { DpoRecordRow } from "../../types/dpo";

function makeRow(overrides: Partial<DpoRecordRow>): DpoRecordRow {
  return {
    id: "r-1",
    role: "controller",
    processName: "test",
    department: "dep",
    purpose: "purpose",
    dataType: "GENERAL",
    legalBasis: "contract",
    retentionPeriod: "1 ปี",
    rightsRefusalNote: null,
    securityMeasuresSummary: null,
    ...overrides,
  };
}

describe("ropa-record-display", () => {
  it("returns Thai label by role", () => {
    expect(roleLabelTh("controller")).toContain("Controller");
    expect(roleLabelTh("processor")).toContain("Processor");
  });

  it("maps processor section14/15 to not-applicable text", () => {
    const row = makeRow({ role: "processor" });
    expect(rightsRefusalDisplay(row)).toContain("ไม่เกี่ยวข้อง");
    expect(securityMeasuresDisplay(row)).toContain("ไม่เกี่ยวข้อง");
  });

  it("returns controller values when available", () => {
    const row = makeRow({
      role: "controller",
      rightsRefusalNote: "ไม่มีเคสปฏิเสธ",
      securityMeasuresSummary: "Encryption | Audit",
    });
    expect(rightsRefusalDisplay(row)).toBe("ไม่มีเคสปฏิเสธ");
    expect(securityMeasuresDisplay(row)).toBe("Encryption | Audit");
  });
});
