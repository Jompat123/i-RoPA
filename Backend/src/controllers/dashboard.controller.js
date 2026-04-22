const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getSummary = async (req) => {
  const user = req.user;
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Data Owner: นับเฉพาะรายการที่ตัวเองสร้าง — สอดคล้องกับ GET /api/ropa
  // ADMIN / VIEWER(DPO) / AUDITOR: ใช้ scope ตาม role ของแต่ละ endpoint
  let whereClause = {};
  if (user.role === 'DEPARTMENT_USER') {
    whereClause = { createdById: user.id };
  } else if (user.role === 'AUDITOR') {
    whereClause = { status: { in: ['APPROVED', 'COMPLETE'] } };
  }

  const [totalRopa, byStatus, recentRopas, sensitiveByDepartment] = await Promise.all([
    prisma.ropaEntry.count({ where: whereClause }),

    prisma.ropaEntry.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true
    }),

    prisma.ropaEntry.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        processName: true,
        status: true,
        updatedAt: true,
        department: { select: { name: true } }
      }
    }),

    prisma.ropaEntry.groupBy({
      by: ['departmentId'],
      where: { ...whereClause, dataType: 'SENSITIVE' },
      _count: true
    })
  ]);

  const statusSummary = byStatus.reduce((acc, d) => {
    acc[d.status] = d._count;
    return acc;
  }, {});

  const departmentIds = sensitiveByDepartment.map((x) => x.departmentId);
  const departments = departmentIds.length
    ? await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true }
    })
    : [];
  const deptNameById = Object.fromEntries(departments.map((d) => [d.id, d.name]));

  // ส่งแยกตาม Prisma — ฝั่ง frontend รวม APPROVED + COMPLETE เป็น "อนุมัติแล้ว"
  // (ห้ามใช้ || รวมกัน จะนับพลาดเมื่อมีทั้ง COMPLETE กับ APPROVED)
  return {
    totalRopa,
    byStatus: {
      DRAFT: statusSummary.DRAFT || 0,
      PENDING: (statusSummary.PENDING || 0) + (statusSummary.SUBMITTED || 0),
      NEEDS_FIX: (statusSummary.NEEDS_FIX || 0) + (statusSummary.REJECTED || 0),
      APPROVED: statusSummary.APPROVED || 0,
      COMPLETE: statusSummary.COMPLETE || 0
    },
    recentActivities: recentRopas.map(r => ({
      id: r.id,
      processName: r.processName,
      departmentName: r.department?.name || 'Unknown',
      status: r.status,
      updatedAt: r.updatedAt
    })),
    sensitiveByDepartment: sensitiveByDepartment.map((row) => ({
      departmentId: row.departmentId,
      departmentName: deptNameById[row.departmentId] || row.departmentId,
      count: row._count
    }))
  };
};

module.exports = { getSummary };