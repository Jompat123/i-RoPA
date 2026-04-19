const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSummary = async (req) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [totalRopa, byDepartment, byRiskLevel, byStatus, recentRopas] = await Promise.all([
    prisma.ropaEntry.count(),

    prisma.ropaEntry.groupBy({
      by: ['departmentId'],
      _count: true
    }),

    prisma.ropaEntry.groupBy({
      by: ['riskLevel'],
      _count: true
    }),

    prisma.ropaEntry.groupBy({
      by: ['status'],
      _count: true
    }),

    prisma.ropaEntry.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    })
  ]);

  const departmentSummary = await Promise.all(byDepartment.map(async (d) => {
    const dept = await prisma.department.findUnique({ where: { id: d.departmentId } });
    return { departmentId: d.departmentId, departmentName: dept?.name || 'Unknown', count: d._count };
  }));

  const riskLevelSummary = byRiskLevel.reduce((acc, d) => {
    acc[d.riskLevel] = d._count;
    return acc;
  }, {});

  const statusSummary = byStatus.reduce((acc, d) => {
    acc[d.status] = d._count;
    return acc;
  }, {});

  const monthlyData = recentRopas.reduce((acc, r) => {
    const month = r.createdAt.toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const monthlyTrend = Object.entries(monthlyData).map(([month, count]) => ({ month, count }));

  return {
    totalRopa,
    byDepartment: departmentSummary,
    byRiskLevel: riskLevelSummary,
    byStatus: statusSummary,
    monthlyTrend
  };
};

module.exports = { getSummary };