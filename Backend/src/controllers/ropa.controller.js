const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createAuditLog = async (userId, action, tableName, recordId, oldData, newData) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      tableName,
      recordId,
      oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
      newData
    }
  });
};

const getAll = async (req) => {
  const { departmentId, riskLevel, status } = req.query;
  const user = req.user;

  const where = {};

  if (user.role === 'DEPARTMENT_USER') {
    where.departmentId = user.departmentId;
  } else if (departmentId) {
    where.departmentId = departmentId;
  }

  if (riskLevel) where.riskLevel = riskLevel;
  if (status) where.status = status;

  return prisma.ropaEntry.findMany({
    where,
    include: { department: true, createdBy: { select: { id: true, name: true, email: true } } }
  });
};

const getOne = async (id) => {
  return prisma.ropaEntry.findUnique({
    where: { id },
    include: { department: true, createdBy: { select: { id: true, name: true, email: true } } }
  });
};

const create = async (req) => {
  const data = req.body;
  data.createdById = req.user.id;
  data.departmentId = data.departmentId || req.user.departmentId;

  const result = await prisma.ropaEntry.create({ data });
  await createAuditLog(req.user.id, 'CREATE', 'RopaEntry', result.id, null, result);
  return result;
};

const update = async (req, id) => {
  const oldData = await getOne(id);

  if (req.user.role === 'DEPARTMENT_USER' && oldData.departmentId !== req.user.departmentId) {
    throw new Error('Forbidden');
  }

  const data = req.body;
  const result = await prisma.ropaEntry.update({ where: { id }, data });
  await createAuditLog(req.user.id, 'UPDATE', 'RopaEntry', id, oldData, result);
  return result;
};

const remove = async (req, id) => {
  const oldData = await getOne(id);
  await prisma.ropaEntry.delete({ where: { id } });
  await createAuditLog(req.user.id, 'DELETE', 'RopaEntry', id, oldData, null);
  return { deleted: true };
};

module.exports = { getAll, getOne, create, update, remove };