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
    ownerName: "-",
    purpose: "purpose",
    dataSourceName: null,
    processorName: null,
    controllerAddress: null,
    personalDataTypes: [],
    dataCategory: null,
    dataType: "GENERAL",
    collectionMethodType: null,
    collectionSource: null,
    legalBasis: "contract",
    minorConsentUnder10: null,
    minorConsent10to20: null,
    crossBorderTransfer: null,
    transferCountry: null,
    transferToAffiliate: null,
    transferAffiliateName: null,
    transferMethod: null,
    protectionStandard: null,
    legalExemption28: null,
    storageDataType: null,
    storageMethod: null,
    retentionPeriod: "1 ปี",
    rightsAccessNote: null,
    deletionMethod: null,
    disclosureNote: null,
    rightsRefusalNote: null,
    securityMeasuresSummary: null,
    securityOrg: null,
    securityTech: null,
    securityPhysical: null,
    securityAccessControl: null,
    securityUserResponsibility: null,
    securityAudit: null,
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
