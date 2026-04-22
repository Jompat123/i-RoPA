const { badRequest } = require('./http-error');

const USER_ROLES = ['ADMIN', 'DEPARTMENT_USER', 'VIEWER', 'AUDITOR'];
const ENTRY_STATUSES = ['DRAFT', 'PENDING', 'NEEDS_FIX', 'APPROVED', 'COMPLETE'];
const DPO_VISIBLE_STATUSES = ['PENDING', 'NEEDS_FIX', 'APPROVED', 'COMPLETE'];

function ensureString(value, field, { required = false, max = 1000 } = {}) {
  if (value == null || value === '') {
    if (required) throw badRequest(`${field} is required`);
    return undefined;
  }
  if (typeof value !== 'string') throw badRequest(`${field} must be string`);
  const out = value.trim();
  if (required && !out) throw badRequest(`${field} is required`);
  if (out.length > max) throw badRequest(`${field} must be <= ${max} characters`);
  return out;
}

function ensureEnum(value, field, allowed, { required = false } = {}) {
  if (value == null || value === '') {
    if (required) throw badRequest(`${field} is required`);
    return undefined;
  }
  if (!allowed.includes(value)) {
    throw badRequest(`${field} must be one of: ${allowed.join(', ')}`);
  }
  return value;
}

function ensureBoolean(value, field) {
  if (value == null) return undefined;
  if (typeof value !== 'boolean') throw badRequest(`${field} must be boolean`);
  return value;
}

function ensureStringArray(value, field, { required = false, maxItem = 120 } = {}) {
  if (value == null) {
    if (required) throw badRequest(`${field} is required`);
    return undefined;
  }
  if (!Array.isArray(value)) throw badRequest(`${field} must be array`);
  const out = value.map((item, idx) => {
    if (typeof item !== 'string') throw badRequest(`${field}[${idx}] must be string`);
    const clean = item.trim();
    if (!clean) throw badRequest(`${field}[${idx}] cannot be empty`);
    if (clean.length > maxItem) throw badRequest(`${field}[${idx}] too long`);
    return clean;
  });
  return out;
}

module.exports = {
  USER_ROLES,
  ENTRY_STATUSES,
  DPO_VISIBLE_STATUSES,
  ensureString,
  ensureEnum,
  ensureBoolean,
  ensureStringArray
};
