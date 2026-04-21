# Frontend-Backend Handoff (Data Owner)

## Environment

- `API_URL` or `NEXT_PUBLIC_API_URL`: backend base URL (example: `http://localhost:3001`)
- `USE_MOCK_DATA` (optional): `true/false` to force mock mode in server loaders
- Cookie required:
  - `auth_token` (JWT)
  - `iropa_user` (JSON for topbar profile)

## Endpoints used by frontend

### 1) Save draft from ROPA form

- Frontend calls `POST /api/ropa/drafts` (Next route handler)
- Next route proxies to backend `POST /api/ropa`
- Expected minimum payload from frontend:
  - `processName` (required)
  - `purpose`
  - `personalDataTypes` (string[])
  - `dataType` (`GENERAL` | `SENSITIVE`)
  - `status` (`DRAFT`)

### 2) My Items page

- Frontend loader calls backend `GET /api/ropa`
- Fields consumed:
  - `id`
  - `processName`
  - `status`
  - `createdAt`
  - `updatedAt`
  - `referenceCode` (optional, fallback generated if missing)
  - `department.name` (optional)

### 3) Data Destruction page

- Frontend loader calls backend `GET /api/ropa`
- Fields consumed:
  - `id`
  - `processName`
  - `status`
  - `createdAt`
  - `destructionProofUrl` or `proofUrl` (optional)
  - `department.name` (optional)

### 4) DPO Records page + Export (Excel/PDF)

- Frontend loader calls backend `GET /api/ropa`
- Records are included when status is `COMPLETE` or `APPROVED`
- Fields consumed:
  - `id`
  - `processName`
  - `department.name` (optional)
  - `purpose` (optional)
  - `dataType` (optional)
  - `legalBasis` (optional)
  - `retentionPeriod` (optional)
  - `ropaRole` or `dataControllerRole` (optional; expected `controller` | `processor`)
  - `rightsRefusalNote` (optional; controller-oriented section 14)
  - `securityTech` / `securityPhysical` / `securityOrg` (optional; section 15 summary)

- Export behavior:
  - Excel (`.xlsx`) and PDF use the same transformed rows from frontend
  - For processor rows, section 14/15 are displayed as not-applicable text in export
  - If no rows match filters, export still includes report header + a no-data row

#### Locked schema (recommended contract)

`GET /api/ropa` item (minimum for DPO Records/export):

```json
{
  "id": "string",
  "processName": "string",
  "status": "COMPLETE | APPROVED | ...",
  "department": { "name": "string | null" },
  "purpose": "string | null",
  "dataType": "GENERAL | SENSITIVE | string | null",
  "legalBasis": "string | null",
  "retentionPeriod": "string | null",
  "ropaRole": "controller | processor",
  "rightsRefusalNote": "string | null",
  "securityTech": "string | null",
  "securityPhysical": "string | null",
  "securityOrg": "string | null"
}
```

Fallback for role field (if `ropaRole` ยังไม่พร้อม):

```json
{
  "dataControllerRole": "controller | processor"
}
```

Frontend rule:

- `ropaRole === "processor"` -> section 14/15 in export use "ไม่เกี่ยวข้อง ..."
- `ropaRole === "controller"` -> section 14/15 display value from API (`null` -> `-`)

## Status Mapping (current frontend)

- My Items:
  - `COMPLETE`/`APPROVED` -> `approved`
  - `REJECTED`/`NEEDS_FIX` -> `needs_fix`
  - others -> `pending`

- Destruction:
  - `COMPLETE` -> `destroyed`
  - others -> date-derived (`near_expiry`/`expired`) as temporary UI logic

## Notes for backend integration

1. If backend can return `referenceCode`, frontend will display real code directly.
2. If backend supports richer status enums, share contract so frontend can remove heuristic mapping.
3. Destruction module should ideally have dedicated endpoint and proof metadata fields for accuracy.
4. For DPO export consistency, backend should return role + section14/15 fields as listed above.
