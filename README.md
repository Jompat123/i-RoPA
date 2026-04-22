# i-RoPA

## รันบนเครื่องใหม่ (แนะนำ)

### 0) สิ่งที่ต้องมี

- Node.js (LTS)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) สำหรับรัน PostgreSQL แบบง่าย

### 1) ติดตั้ง dependencies

```bash
npm --prefix Backend install
npm --prefix Frontend install
```

### 2) รัน PostgreSQL ด้วย Docker

จากโฟลเดอร์ root ของโปรเจกต์:

```bash
docker compose up -d
```

รอสักครู่จน container `healthy` (ครั้งแรกดึง image อาจใช้เวลา)

### 3) ตั้งค่า env

**Backend** — คัดลอกตัวอย่างแล้วแก้ถ้าจำเป็น:

```bash
cp Backend/.env.example Backend/.env
```

**Frontend** — ชี้ API ไปที่พอร์ตเดียวกับ `PORT` ใน `Backend/.env` (เทมเพลตใน repo นี้ใช้ **4001**):

```bash
cp Frontend/.env.local.example Frontend/.env.local
```

> **สำคัญ:** อย่าให้ `NEXT_PUBLIC_API_URL` ชี้ไปที่พอร์ต **3000** (นั่นคือ Next.js) — ต้องชี้ไป **Backend (เช่น 4001)** มิฉะนั้น login/proxy จะพัง

### 4) สร้างตาราง + seed ข้อมูล

```bash
npm --prefix Backend run db:reset
```

(หรือ `npm run db:setup` จาก root จะ `docker up` + migrate + seed รวดเดียว หลังมี `Backend/.env` แล้ว)

### 5) รัน app (สอง terminal)

Terminal 1 — API:

```bash
npm --prefix Backend run dev
```

Terminal 2 — Next.js (มัก `http://localhost:3000`):

```bash
npm --prefix Frontend run dev
```

### 6) ล็อกอินทดสอบ (หลัง seed)

| อีเมล | รหัส | บทบาท |
|--------|--------|--------|
| `admin@i-ropa.local` | `password123` | Admin |
| `dpo@i-ropa.local` | `password123` | DPO |
| `owner@i-ropa.local` | `password123` | Data Owner |
| `auditor@i-ropa.local` | `password123` | Auditor |

---

## แก้ error “เชื่อมต่อฐานข้อมูลไม่ได้”

1. ตรวจว่า Docker รันแล้ว: `docker compose ps` (หรือ Docker Desktop เปิดอยู่)
2. ตรวจ `Backend/.env` ว่า `DATABASE_URL` ตรงกับ `docker-compose.yml` (user `postgres` / password `postgres` / db `iropa` / port `5432`)
3. รันอีกครั้ง: `npm --prefix Backend run db:reset`

## หยุดฐานข้อมูล

```bash
npm run db:down
```
