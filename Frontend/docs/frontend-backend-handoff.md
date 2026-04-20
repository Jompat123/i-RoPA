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
