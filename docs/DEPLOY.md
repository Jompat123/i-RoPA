# Deploy แบบจับมือ (Neon + Render + Vercel)

## อธิบายสำหรับมือใหม่ (อ่านก่อนทำขั้นตอน)

### Deploy คืออะไร

ตอน dev นายรัน `npm run dev` บนเครื่องตัวเอง โลกออนไลน์**เข้าเครื่องนายไม่ได้** ถ้าเพื่อนอยากลอง หรืออยาก “เปิดเว็บงานจริง” ต้องเอาโค้ดไป **วางบน server อินเทอร์เน็ต** ให้ URL นึง — นั่นแหละคือ deploy โดยสรุป: **โค้ดเดิม แต่รันบนเครื่อง cloud ตลอด 24 ชม.**

### ทำไม i-RoPA ถึงแยก “สามชิ้น”

แอปนี้สมองแบ่งเป็น 3 ส่วน (อธิบายแบบร้านอาหาร):

1. **ฐานข้อมูล (Postgres / Neon)**  
   ที่เก็บ user, ข้อมูล ROPA ฯลฯ — เหมือน **ตู้เย็นเก็บวัตถุดิบ** ต้องมีที่เก็บถาวรบน internet

2. **Backend (API บน Render)**  
   โค้ด Express ในโฟลเดอร์ `Backend` — รับ request, เช็กรหัส, อ่าน/เขียน DB  
   — เหมือน **ครัว** รับ order ไปทำ แล้วส่งออก

3. **Frontend (Next.js บน Vercel)**  
   หน้าเว็บที่ user เห็น — ถาม API เอาข้อมูล  
   — เหมือน **หน้าร้าน** ที่ลูกค้าเข้า

เครื่องคนละตัว แต่ต้อง “คุยกันได้” ผ่าน **URL** และ **ตัวแปรลับ (env)**

### คำสำคัญที่เจอบ่อย

- **URL / โดเมน** = ที่อยู่เว็บบน internet เช่น `https://xxx.vercel.app` หรือ `https://api-xxx.onrender.com`
- **Connection string (DATABASE_URL)** = บรรทัดเดียวบอกว่า “เชื่อม Postgres ยังไง ที่ host ไหน user/รหัส อะไร” ได้จากหน้า Neon — **ห้าม** paste ลง Git หรือส่ง public
- **Environment variables (env)** = ตั้งบน Vercel/Render แทนไฟล์ `.env` บนเครื่อง — production อ่านค่าจากที่นั่น
- **`NEXT_PUBLIC_API_URL` (Vercel)** = บอกฝั่งเว็บว่า “ไปยิง API ที่ **URL นี้**” ตอน build/run มันถูกฝังในเว็บ (ฝั่ง public) ดังนั้นต้องใส่ **URL ของ API ตัวจริง** ไม่ใช่ `localhost` อีกแล้ว
- **`CORS` / `CORS_ORIGIN` (ฝั่ง API)** = browser กันคนอื่นเอาเว็บหลอกมาเรียก API ของนาย; ต้องบอก API ว่า “ยอมให้เว็บที่ **origin นี้** เรียกมา” — ใส่ **URL ของ Vercel** หลัง deploy เสร็จ
- **JWT** = token ล็อกอิน; **`JWT_SECRET`** คือกุญแจลับที่ใช้ sign token — ตัว dev กับ **production ควรคนละตัว** ยาว สุ่ม

### ลำดับ “ทำก่อน–หลัง” สำคัญยังไง

- **ฐานข้อมูลก่อน** — ไม่งั้น API ไปผูกกับ DB อะไรไม่รู้
- **API ก่อน** (หรือพร้อมรู้ **URL ของ API**) — จะไปบอก Vercel ให้ `NEXT_PUBLIC_API_URL` ชี้ไป
- **เว็บ (Vercel) ต่อ** — ได้ **URL ของเว็บ** แล้ว ค่อยกลับไปแก้ **`CORS_ORIGIN`** บน API ให้ตรง URL เว็บ ไม่งั้น browser จะ block การเรียก API (CORS error)

### ตอน user กด “ล็อกอิน” เกิดอะไรขึ้น (ง่ายสุด)

1. หน้าเว็บ (Vercel) รู้ว่า API อยู่ที่ `NEXT_PUBLIC_API_URL`
2. ส่ง email/password ไปที่ `…/api/auth/login` บน **Render**
3. API ไปเช็กกับ **Postgres (Neon)** ว่า user มีจริง
4. ถ้าใช่ ส่ง token กลับมา; เว็บเก็บ (มัก localStorage / cookie) แล้วไปหน้าหลัง login

ถ้า **CORS ไม่ตรง** หรือ **URL API ยังชี้ localhost** ขั้นนี้จะพังทั้ง flow

### อ่านจบแล้ว ไปทำขั้นตอนล่าง

ด้านล่างเป็นคู่มือ “กดอะไร ที่ไหน” ตามเดิม

---

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
