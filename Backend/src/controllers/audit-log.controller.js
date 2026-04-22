const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getRecent = async (limit = 20) => {
  const take = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.trunc(limit))) : 20;
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      action: true,
      tableName: true,
      recordId: true,
      createdAt: true,
      user: {
        select: { id: true, name: true, email: true, role: true }
      }
    }
  });
};

module.exports = { getRecent };
