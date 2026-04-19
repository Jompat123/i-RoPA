const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const getAll = async (req) => {
  const { departmentId, role } = req.query;
  const user = req.user;

  const where = {};

  if (user.role === 'DEPARTMENT_USER') {
    where.departmentId = user.departmentId;
  } else if (departmentId) {
    where.departmentId = departmentId;
  }

  if (role) where.role = role;

  return prisma.user.findMany({
    where,
    select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true, department: true }
  });
};

const getOne = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true, department: true }
  });
};

const create = async (req) => {
  const { name, email, password, role, departmentId } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.user.create({
    data: { name, email, passwordHash, role, departmentId },
    select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true }
  });

  await prisma.auditLog.create({
    data: { userId: req.user.id, action: 'CREATE', tableName: 'User', recordId: result.id, newData: result }
  });

  return result;
};

const update = async (req, id) => {
  const oldData = await prisma.user.findUnique({ where: { id } });

  if (req.user.role !== 'ADMIN' && req.user.id !== id) {
    throw new Error('Forbidden');
  }

  const { name, email, role, departmentId, password } = req.body;
  const data = { name, email, role, departmentId };

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const result = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, departmentId: true, createdAt: true } });

  await prisma.auditLog.create({
    data: { userId: req.user.id, action: 'UPDATE', tableName: 'User', recordId: id, oldData, newData: result }
  });

  return result;
};

const remove = async (req, id) => {
  const oldData = await prisma.user.findUnique({ where: { id } });
  await prisma.user.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { userId: req.user.id, action: 'DELETE', tableName: 'User', recordId: id, oldData, newData: null }
  });

  return { deleted: true };
};

module.exports = { getAll, getOne, create, update, remove };