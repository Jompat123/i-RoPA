const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { badRequest, notFound } = require('../lib/http-error');
const { USER_ROLES, ensureString, ensureEnum } = require('../lib/validation');

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
  const name = ensureString(req.body?.name, 'name', { required: true, max: 120 });
  const email = ensureString(req.body?.email, 'email', { required: true, max: 255 });
  const password = ensureString(req.body?.password, 'password', { required: true, max: 200 });
  const role = ensureEnum(req.body?.role, 'role', USER_ROLES, { required: true });
  const departmentId = req.body?.departmentId || null;

  if (['DEPARTMENT_USER', 'VIEWER', 'AUDITOR'].includes(role) && !departmentId) {
    throw badRequest('departmentId is required for non-admin roles');
  }

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
  if (!oldData) throw notFound('User not found');

  const data = {};
  if (req.body?.name !== undefined) data.name = ensureString(req.body.name, 'name', { required: true, max: 120 });
  if (req.body?.email !== undefined) data.email = ensureString(req.body.email, 'email', { required: true, max: 255 });
  if (req.body?.role !== undefined) data.role = ensureEnum(req.body.role, 'role', USER_ROLES, { required: true });
  if (req.body?.departmentId !== undefined) data.departmentId = req.body.departmentId || null;

  if (req.body?.password !== undefined) {
    const password = ensureString(req.body.password, 'password', { required: true, max: 200 });
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
  if (!oldData) throw notFound('User not found');
  await prisma.user.delete({ where: { id } });

  await prisma.auditLog.create({
    data: { userId: req.user.id, action: 'DELETE', tableName: 'User', recordId: id, oldData, newData: null }
  });

  return { deleted: true };
};

module.exports = { getAll, getOne, create, update, remove };