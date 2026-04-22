# Deploy แบบจับมือ (Neon + Render + Vercel)

ลำดับสำคัญ: **ฐานข้อมูล → API → เว็บ**

## 1) Neon — PostgreSQL

1. ไป [https://neon.tech](https://neon.tech) สมัคร / สร้าง project
2. สร้าง database แล้วคัดลอก **Connection string** (แบบมี password)
3. เก็บไว้ใส่เป็น `DATABASE_URL` ทีหลัง

## 2) Render — Backend (API)

**ทาง A: ใช้ Blueprint ใน repo**

1. Push โค้ดขึ้น GitHub (มีไฟล์ `render.yaml` ที่ root)
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. เลือก repo → ยืนยัน
4. หน้า Environment ให้ใส่ค่า:
   - `DATABASE_URL` = connection string จาก Neon (เติม `?sslmode=require` ถ้า Neon บังคับ SSL — ดูในเอกสาร Neon)
   - `CORS_ORIGIN` = URL เว็บ Vercel (ขั้นตอน 3) — ตอนแรกใส่ placeholder แล้วกลับมาแก้ได้ เช่น `https://xxx.vercel.app`
   - `JWT_SECRET` — Render อาจ generate ให้แล้วจาก blueprint; หรือใส่สตริงยาวๆ เอง

**ทาง B: สร้าง Web Service มือ**

1. **New** → **Web Service** → เลือก repo
2. **Root Directory**: `Backend`
3. **Build Command**: `npm ci && npx prisma generate`
4. **Start Command**: `npm run start:web`
5. **Health Check Path**: `/health`
6. **Environment** เหมือนข้างบน

หลัง deploy สำเร็จ จด **URL** ของ API (เช่น `https://iropa-api.onrender.com`)

ทดที่ browser: `https://<api-url>/health` ควรได้ JSON มี `"status":"ok"`

## 3) Vercel — Frontend (Next.js)

1. [https://vercel.com](https://vercel.com) → **Add New** → **Project** → Import repo
2. **Root Directory**: เลือก `Frontend`
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = URL ของ Render API (มี `https://` ตรงท้าย ไม่มี slash เกิน ถ้าโค้ดไม่คาดหวัง)
   - `API_URL` = ค่าเดียวกัน (ถ้าใช้ใน server components / rewrites)
   - `USE_MOCK_DATA` = `false`
4. Deploy

หลังได้ URL เว็บ (เช่น `https://iropa.vercel.app`) กลับไป **Render → Environment → CORS_ORIGIN** ใส่ URL นี้แล้ว **Redeploy** API

## 4) Migration ฐานข้อมูล

คำสั่ง `start:web` รัน `prisma migrate deploy` ทุกครั้ง API start — โดยมาก deploy ครั้งแรกก็ apply migration แล้ว

ถ้า DB ยังไม่ติด: ดู log บน Render; ตรวจ `DATABASE_URL` กับ SSL

## 5) Seed ข้อมูลแรก (ถ้าต้องการ user ทดรอง)

รันจากเครื่อง local ชี้ไป **production** (ระวัง — รู้ว่ากำลังรันกับ DB ตัวจริง):

```bash
cd Backend
# ตั้ง DATABASE_URL ชั่วคราวเป็นของ Neon
export DATABASE_URL="postgresql://..."
export JWT_SECRET="..."  # ไม่บังคับสำหรับ seed
node prisma/seed.js
```

หรือใช้ Render **Shell** (ถ้าแพลนที่ใช้มี) รัน `node prisma/seed.js` หลังตั้ง env

## Checklist สุดท้าย

- [ ] `/health` บน API ตอบ ok
- [ ] เปิดเว็บ Vercel แล้ว login ได้
- [ ] ไม่มี CORS error ใน DevTools
- [ ] ไม่ commit `.env` / connection string ลง Git
