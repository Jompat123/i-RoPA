export type BackendRole = "ADMIN" | "DEPARTMENT_USER" | "VIEWER" | "AUDITOR";
export type AppRole = "ADMIN" | "DATA_OWNER" | "DPO" | "AUDITOR";
export type BackendStatus = "DRAFT" | "PENDING" | "NEEDS_FIX" | "APPROVED" | "COMPLETE";

export function toBackendRole(role: AppRole): BackendRole {
  if (role === "DATA_OWNER") return "DEPARTMENT_USER";
  if (role === "DPO") return "VIEWER";
  return role;
}

export function toAppRole(role: string): AppRole {
  const r = String(role || "").toUpperCase();
  if (r === "DEPARTMENT_USER" || r === "DATA_OWNER") return "DATA_OWNER";
  if (r === "VIEWER" || r === "DPO") return "DPO";
  if (r === "AUDITOR") return "AUDITOR";
  return "ADMIN";
}

const ropaAllowedFields = new Set([
  "processName",
  "role",
  "purpose",
  "personalDataTypes",
  "dataCategory",
  "dataType",
  "dataControllerAddress",
  "collectionMethod",
  "collectionMethodType",
  "dataSource",
  "collectionSource",
  "legalBasis",
  "minorConsentUnder10",
  "minorConsent10to20",
  "minorConsentOtherNote",
  "crossBorderTransfer",
  "transferCountry",
  "transferToAffiliate",
  "transferAffiliateName",
  "transferMethod",
  "protectionStandard",
  "legalExemption28",
  "retentionPeriod",
  "storageDataType",
  "storageMethod",
  "rightsAccessNote",
  "deletionMethod",
  "disclosureNote",
  "rightsRefusalNote",
  "securityMeasuresSummary",
  "securityOrg",
  "securityTech",
  "securityPhysical",
  "securityAccessControl",
  "securityUserResponsibility",
  "securityAudit",
  "riskLevel",
  "status",
  "reviewDecision",
  "reviewNote",
  "reviewChecks",
  "departmentId",
]);

export function sanitizeRopaPayload(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([key]) => ropaAllowedFields.has(key)));
}

export function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const p = payload as Record<string, unknown>;
  if (typeof p.error === "string" && p.error.trim()) return p.error.trim();
  if (typeof p.message === "string" && p.message.trim()) return p.message.trim();
  return fallback;
}
