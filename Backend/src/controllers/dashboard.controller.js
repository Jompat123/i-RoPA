const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSummary = async (req) => {
  const user = req.user;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Data Owner: เห็นข้อมูลของ department ตัวเองเท่านั้น
  // ADMIN/VIEWER: เห็นข้อมูลทั้งหมด
  let whereClause = {};
  if (user.role === 'DEPARTMENT_USER' && user.departmentId) {
    whereClause = { departmentId: user.departmentId };
  }

  const [totalRopa, byStatus, recentRopas] = await Promise.all([
    prisma.ropaEntry.count({ where: whereClause }),

    prisma.ropaEntry.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true
    }),

    prisma.ropaEntry.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      take: 5
    })
  ]);

  const statusSummary = byStatus.reduce((acc, d) => {
    acc[d.status] = d._count;
    return acc;
  }, {});

  // Format สำหรับ Frontend
  return {
    totalRopa,
    byStatus: {
      DRAFT: statusSummary.DRAFT || 0,
      PENDING: statusSummary.PENDING || statusSummary.SUBMITTED || 0,
      COMPLETE: statusSummary.COMPLETE || statusSummary.APPROVED || 0,
      REJECTED: statusSummary.REJECTED || statusSummary.NEEDS_FIX || 0
    },
    recentActivities: recentRopas.map(r => ({
      id: r.id,
      processName: r.processName,
      status: r.status,
      updatedAt: r.updatedAt
    }))
  };
};

module.exports = { getSummary };