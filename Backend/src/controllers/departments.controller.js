const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAll = async () => {
  return prisma.department.findMany({
    include: { _count: { select: { users: true, ropaEntries: true } } }
  });
};

const getOne = async (id) => {
  return prisma.department.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, role: true } },
      ropaEntries: { select: { id: true, processName: true, status: true, riskLevel: true } },
      _count: { select: { users: true, ropaEntries: true } }
    }
  });
};

const create = async (req) => {
  const { name, description } = req.body;
  const result = await prisma.department.create({ data: { name, description } });

  await prisma.auditLog.create({
    data: { userId: req.user.id, action: 'CREATE', tableName: 'Department', recordId: result.id, newData: result }
  });

  return result;
};

const update = async (req, id) => {
  const oldData = await prisma.department.findUnique({ where: { id } });
  const { name, description } = req.body;
  const result = await prisma.department.update({ where: { id }, data: { name, description } });

  await prisma.auditLog.create({
    data: { userId: req.user.id, action: 'UPDATE', tableName: 'Department', recordId: id, oldData, newData: result }
  });

  return result;
};

const remove = async (req, id) => {
  const oldData = await prisma.department.findUnique({ where: { id } });
  await prisma.department.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { userId: req.user.id, action: 'DELETE', tableName: 'Department', recordId: id, oldData, newData: null }
  });

  return { deleted: true };
};

module.exports = { getAll, getOne, create, update, remove };