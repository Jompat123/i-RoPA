const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

// ต้องตั้งก่อน require app — dotenv ใน index จะไม่ override ค่าที่มีแล้ว
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@127.0.0.1:5432/iropa?schema=public';
}

const { app, prisma } = require('../src/index.js');

test('GET / คืนข้อความว่า API ทำงาน', async () => {
  const res = await request(app).get('/').expect(200);
  assert.equal(res.body.message, 'ROPA API is running');
});

test('GET /health สถานะ ok เมื่อเชื่อมฐานข้อมูลได้', async () => {
  const res = await request(app).get('/health').expect(200);
  assert.equal(res.body.status, 'ok');
});

test('POST /api/auth/login สำเร็จกับ user จาก seed', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send({ email: 'admin@i-ropa.local', password: 'password123' })
    .expect(200);

  assert.ok(typeof res.body.token === 'string' && res.body.token.length > 0);
  assert.equal(res.body.user?.email, 'admin@i-ropa.local');
});

after(async () => {
  await prisma.$disconnect();
});
