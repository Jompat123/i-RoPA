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
    where.createdById = user.id;
  } else if (user.role === 'AUDITOR') {
    where.status = 'COMPLETE';
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

const getOne = async (req, id) => {
  const row = await prisma.ropaEntry.findUnique({
    where: { id },
    include: { department: true, createdBy: { select: { id: true, name: true, email: true } } }
  });
  if (!row) return null;
  if (req.user.role === 'DEPARTMENT_USER' && row.createdById !== req.user.id) {
    throw new Error('Forbidden');
  }
  if (req.user.role === 'AUDITOR' && row.status !== 'COMPLETE') {
    throw new Error('Forbidden');
  }
  return row;
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
  const oldData = await getOne(req, id);
  if (!oldData) {
    throw new Error('Not found');
  }

  if (req.user.role === 'DEPARTMENT_USER' && oldData.createdById !== req.user.id) {
    throw new Error('Forbidden');
  }

  const data = req.body;
  let updateData = data;
  if (req.user.role === 'VIEWER') {
    const allowedKeys = ['status', 'reviewDecision', 'reviewNote', 'reviewChecks'];
    updateData = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedKeys.includes(key))
    );
    if (!Object.keys(updateData).length) {
      throw new Error('Forbidden');
    }
  }
  const result = await prisma.ropaEntry.update({ where: { id }, data: updateData });
  await createAuditLog(req.user.id, 'UPDATE', 'RopaEntry', id, oldData, result);
  return result;
};

const remove = async (req, id) => {
  const oldData = await getOne(req, id);
  if (!oldData) {
    throw new Error('Not found');
  }
  await prisma.ropaEntry.delete({ where: { id } });
  await createAuditLog(req.user.id, 'DELETE', 'RopaEntry', id, oldData, null);
  return { deleted: true };
};

module.exports = { getAll, getOne, create, update, remove };