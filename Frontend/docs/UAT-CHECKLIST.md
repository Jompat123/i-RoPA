# UAT Checklist (Current Run)

- Run at: 2026-04-22T20:27:51
- Frontend: http://localhost:3000
- Backend: http://localhost:4001

| Check | Result | Notes |
|---|---|---|
| Front login admin | PASS | ok=true |
| Front login dpo | PASS | ok=true |
| Front login owner | PASS | ok=true |
| Front login auditor | PASS | ok=true |
| Front route owner / | PASS | HTTP 200 |
| Front route admin /admin | PASS | HTTP 200 |
| Front route dpo /dpo | PASS | HTTP 200 |
| Front route auditor /dpo/records | PASS | HTTP 200 |
| Front RBAC redirect owner /admin | PASS | HTTP 200 redirect_meta=True |
| Front RBAC redirect admin /dpo | PASS | HTTP 200 redirect_meta=True |
| Front RBAC redirect dpo /admin | PASS | HTTP 200 redirect_meta=True |
| Front RBAC redirect auditor /dpo | PASS | HTTP 200 redirect_meta=True |
| Back dashboard summary owner | PASS | HTTP 200 totalRopa=0 |
| Back dashboard summary dpo | PASS | HTTP 200 totalRopa=0 |
| Back dashboard summary auditor | PASS | HTTP 200 totalRopa=0 |
| Back dashboard summary admin | PASS | HTTP 200 totalRopa=0 |
| Back audit logs admin | PASS | HTTP 200 count=4 |
| Back ropa owner list | PASS | HTTP 200 count=0 |

- Total checks: 18
- Failed: 0
