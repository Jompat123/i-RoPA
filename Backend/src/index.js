require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();
const prisma = new PrismaClient();

['DATABASE_URL', 'JWT_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
});

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((x) => x.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.length || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  }
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'ROPA API is running' });
});

app.get('/health', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', require('./routes/auth.js'));
app.use('/api/ropa', require('./routes/ropa.js'));
app.use('/api/users', require('./routes/users.js'));
app.use('/api/departments', require('./routes/departments.js'));
app.use('/api/dashboard', require('./routes/dashboard.js'));
app.use('/api/audit-logs', require('./routes/audit-logs.js'));
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, prisma };