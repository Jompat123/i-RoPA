const { Prisma } = require('@prisma/client');
const { HttpError } = require('../lib/http-error');

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * ข้อผิดพลาด Prisma/DB ที่ user มักเจอตอน dev: PostgreSQL ไม่เปิด หรือ DATABASE_URL ไม่ตรง
 */
function isDatabaseConnectivityError(err) {
  if (!err) return false;
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // https://www.prisma.io/docs/reference/api-reference/error-reference
    return ['P1001', 'P1002', 'P1003', 'P1017'].includes(String(err.code));
  }
  const msg = String(err.message || '');
  return msg.includes("Can't reach database server") || msg.includes('ECONNREFUSED');
}

function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details
    });
  }

  if (isDatabaseConnectivityError(err)) {
    console.error(err);
    return res.status(503).json({
      error:
        'เชื่อมต่อฐานข้อมูลไม่ได้: ตรวจสอบว่า PostgreSQL รันอยู่ และค่า DATABASE_URL ใน Backend ถูกต้อง จากนั้นรัน npx prisma migrate deploy',
      code: err.code
    });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
