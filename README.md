# i-RoPA (Quick Start)

วิธีรันแบบง่ายที่สุด

## 1) ติดตั้ง dependencies

```bash
npm install
npm --prefix Backend install
npm --prefix Frontend install
```

## 2) เตรียมข้อมูลครั้งแรก

```bash
npm --prefix Backend run db:seed
```

## 3) รันระบบ (เปิด 2 terminal)

### Terminal 1
```bash
npm --prefix Backend run dev
```

### Terminal 2
```bash
npm --prefix Frontend run dev
```

เปิดใช้งานที่:
- Frontend: `http://localhost:3001` (หรือพอร์ตที่แสดงใน terminal)
- Backend: `http://localhost:3000`

## บัญชีทดสอบ

```txt
admin@i-ropa.local / password123
dpo@i-ropa.local / password123
owner@i-ropa.local / password123
auditor@i-ropa.local / password123
```