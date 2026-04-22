วิธีที่ถูก (บนเครื่องใหม่)
1) ติดตั้ง
npm install
npm --prefix Backend install
npm --prefix Frontend install
2) ตั้ง env
Backend/.env ต้องมี DATABASE_URL, JWT_SECRET, PORT
Frontend/.env.local ต้องมี
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
3) เตรียมฐานข้อมูล
npm --prefix Backend run db:seed
4) ถ้าจะใช้ start ต้อง build ก่อน
npm --prefix Frontend run build
5) รันจริง (2 terminal)
npm --prefix Backend run start
npm --prefix Frontend run start
ถ้าต้องการ “ง่ายสุด” สำหรับ dev ให้ใช้ dev แทน start:


npm --prefix Backend run dev
npm --prefix Frontend run dev