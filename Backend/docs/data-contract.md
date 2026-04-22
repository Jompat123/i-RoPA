# i-RoPA API Data Contract (v1)

## Canonical Roles

- `ADMIN`
- `DEPARTMENT_USER` (Frontend alias: `DATA_OWNER`)
- `VIEWER` (Frontend alias: `DPO`)
- `AUDITOR`

## Canonical Status Workflow

- `DRAFT`
- `PENDING`
- `NEEDS_FIX`
- `APPROVED`
- `COMPLETE`

## RopaEntry Schema (shared)

```json
{
  "id": "uuid",
  "processName": "Employee onboarding",
  "role": "controller",
  "dataControllerAddress": "Bangkok, Thailand",
  "purpose": "HR operations",
  "personalDataTypes": ["name", "email"],
  "dataCategory": "employee",
  "dataType": "SENSITIVE",
  "collectionMethod": "web form",
  "collectionMethodType": "soft",
  "dataSource": "employee",
  "collectionSource": "direct",
  "legalBasis": "consent",
  "minorConsentUnder10": false,
  "minorConsent10to20": false,
  "crossBorderTransfer": true,
  "transferCountry": "Singapore",
  "transferToAffiliate": true,
  "transferMethod": "SCC",
  "protectionStandard": "ISO27001",
  "legalExemption28": null,
  "retentionPeriod": "5 years",
  "storageDataType": "soft",
  "storageMethod": "encrypted cloud",
  "rightsAccessNote": "Email request within 30 days",
  "deletionMethod": "scheduled purge",
  "disclosureNote": "internal HR + payroll",
  "rightsRefusalNote": null,
  "securityMeasuresSummary": "Policy + encryption + audit",
  "securityOrg": "PDPA policy",
  "securityTech": "AES-256",
  "securityPhysical": "badge access",
  "securityAccessControl": "RBAC",
  "securityUserResponsibility": "annual training",
  "securityAudit": "quarterly",
  "riskLevel": "MEDIUM",
  "status": "PENDING",
  "reviewDecision": null,
  "reviewNote": null,
  "reviewChecks": [],
  "departmentId": "uuid",
  "createdById": "uuid",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-02T00:00:00.000Z"
}
```

## Endpoint Contracts

### `POST /api/auth/login`

Request:
```json
{ "email": "admin@i-ropa.local", "password": "password123" }
```

Response:
```json
{
  "token": "jwt",
  "user": {
    "id": "uuid",
    "name": "Admin",
    "email": "admin@i-ropa.local",
    "role": "ADMIN",
    "departmentId": null
  }
}
```

### `GET /api/users`

Response: array of user objects with `id,name,email,role,departmentId,createdAt`.

### `GET /api/departments`

Response: array of department objects with `id,name,description,_count`.

### `GET /api/ropa` and `GET /api/ropa/:id`

Response: `RopaEntry` object(s) as defined above.

### `PUT /api/ropa/:id` (DPO review update)

Request:
```json
{
  "status": "NEEDS_FIX",
  "reviewDecision": "reject",
  "reviewNote": "Need clearer legal basis",
  "reviewChecks": [{ "key": "legal_basis", "result": "fail", "note": "missing detail" }]
}
```

### `GET /api/dashboard/summary`

Response:
```json
{
  "totalRopa": 12,
  "byStatus": { "DRAFT": 2, "PENDING": 3, "NEEDS_FIX": 1, "COMPLETE": 6 },
  "recentActivities": [{ "id": "uuid", "processName": "x", "status": "PENDING", "updatedAt": "iso" }],
  "sensitiveByDepartment": [{ "departmentId": "uuid", "departmentName": "HR", "count": 4 }]
}
```
