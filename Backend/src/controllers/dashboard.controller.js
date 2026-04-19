const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSummary = async (req) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [totalRopa, byDepartment, byRiskLevel, byStatus, monthlyTrend] = await Promise.all([
    prisma.ropaEntry.count(),

    prisma.ropaEntry.groupBy({
      by: ['departmentId'],
      _count: true,
      include: { department: true }
    }),

    prisma.ropaEntry.groupBy({
      by: ['riskLevel'],
      _count: true
    }),

    prisma.ropaEntry.groupBy({
      by: ['status'],
      _count: true
    }),

    prisma.ropaEntry.groupBy({
      by: [{ createdAt: 'asc' }],
      _count: true,
      where: { createdAt: { gte: sixMonthsAgo } }
    })
  ]);

  const departmentSummary = byDepartment.map(d => ({
    departmentId: d.departmentId,
    departmentName: d.department?.name || 'Unknown',
    count: d._count
  }));

  const riskLevelSummary = byRiskLevel.reduce((acc, d) => {
    acc[d.riskLevel] = d._count;
    return acc;
  }, {});

  const statusSummary = byStatus.reduce((acc, d) => {
    acc[d.status] = d._count;
    return acc;
  }, {});

  const monthlyData = monthlyTrend.reduce((acc, d) => {
    const month = d.createdAt.toISOString().slice(0, 7);
    acc[month] = (acc[month] || 0) + d._count;
    return acc;
  }, {});

  const monthlyTrendFormatted = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count
  }));

  return {
    totalRopa,
    byDepartment: departmentSummary,
    byRiskLevel: riskLevelSummary,
    byStatus: statusSummary,
    monthlyTrend: monthlyTrendFormatted
  };
};

module.exports = { getSummary };