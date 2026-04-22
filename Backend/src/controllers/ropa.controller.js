const { PrismaClient } = require('@prisma/client');
const { badRequest, forbidden, notFound } = require('../lib/http-error');
const {
  ENTRY_STATUSES,
  DPO_VISIBLE_STATUSES,
  ensureString,
  ensureEnum,
  ensureBoolean,
  ensureStringArray
} = require('../lib/validation');

const prisma = new PrismaClient();

async function nextReferenceCode() {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const count = await prisma.ropaEntry.count({
    where: { createdAt: { gte: start, lt: end } }
  });
  return `ROPA-${year}-${String(count + 1).padStart(4, '0')}`;
}

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
    where.status = { in: ['APPROVED', 'COMPLETE'] };
  } else if (user.role === 'VIEWER') {
    where.status = { in: DPO_VISIBLE_STATUSES };
  } else if (departmentId) {
    where.departmentId = departmentId;
  }

  if (riskLevel) where.riskLevel = riskLevel;
  if (status) {
    ensureEnum(status, 'status', ENTRY_STATUSES);
    where.status = status;
  }

  return prisma.ropaEntry.findMany({
    where,
    include: { department: true, createdBy: { select: { id: true, name: true, email: true, role: true } } }
  });
};

const getOne = async (req, id) => {
  const row = await prisma.ropaEntry.findUnique({
    where: { id },
    include: { department: true, createdBy: { select: { id: true, name: true, email: true, role: true } } }
  });
  if (!row) return null;
  if (req.user.role === 'DEPARTMENT_USER' && row.createdById !== req.user.id) {
    throw forbidden();
  }
  if (req.user.role === 'AUDITOR' && !['APPROVED', 'COMPLETE'].includes(row.status)) {
    throw forbidden();
  }
  if (req.user.role === 'VIEWER' && !DPO_VISIBLE_STATUSES.includes(row.status)) {
    throw forbidden();
  }
  return row;
};

const mapRopaPayload = (body, { isUpdate = false, role } = {}) => {
  const payload = {
    processName: ensureString(body.processName, 'processName', { required: !isUpdate, max: 255 }),
    role: ensureEnum(body.role, 'role', ['controller', 'processor']),
    purpose: ensureString(body.purpose, 'purpose', { max: 3000 }),
    personalDataTypes: ensureStringArray(body.personalDataTypes, 'personalDataTypes', { required: !isUpdate }),
    dataCategory: ensureString(body.dataCategory, 'dataCategory', { max: 255 }),
    dataType: ensureEnum(body.dataType, 'dataType', ['GENERAL', 'SENSITIVE']),
    dataControllerAddress: ensureString(body.dataControllerAddress, 'dataControllerAddress', { max: 500 }),
    collectionMethod: ensureString(body.collectionMethod, 'collectionMethod', { max: 500 }),
    collectionMethodType: ensureEnum(body.collectionMethodType, 'collectionMethodType', ['soft', 'hard']),
    dataSource: ensureString(body.dataSource, 'dataSource', { max: 255 }),
    collectionSource: ensureEnum(body.collectionSource, 'collectionSource', ['direct', 'other']),
    legalBasis: ensureString(body.legalBasis, 'legalBasis', { max: 255 }),
    minorConsentUnder10: ensureBoolean(body.minorConsentUnder10, 'minorConsentUnder10'),
    minorConsent10to20: ensureBoolean(body.minorConsent10to20, 'minorConsent10to20'),
    minorConsentOtherNote: ensureString(body.minorConsentOtherNote, 'minorConsentOtherNote', { max: 500 }),
    crossBorderTransfer: ensureBoolean(body.crossBorderTransfer, 'crossBorderTransfer'),
    transferCountry: ensureString(body.transferCountry, 'transferCountry', { max: 255 }),
    transferToAffiliate: ensureBoolean(body.transferToAffiliate, 'transferToAffiliate'),
    transferAffiliateName: ensureString(
      body.transferAffiliateName,
      'transferAffiliateName',
      { max: 500 },
    ),
    transferMethod: ensureString(body.transferMethod, 'transferMethod', { max: 500 }),
    protectionStandard: ensureString(body.protectionStandard, 'protectionStandard', { max: 500 }),
    legalExemption28: ensureString(body.legalExemption28, 'legalExemption28', { max: 500 }),
    retentionPeriod: ensureString(body.retentionPeriod, 'retentionPeriod', { max: 255 }),
    storageDataType: ensureEnum(body.storageDataType, 'storageDataType', ['soft', 'hard']),
    storageMethod: ensureString(body.storageMethod, 'storageMethod', { max: 500 }),
    rightsAccessNote: ensureString(body.rightsAccessNote, 'rightsAccessNote', { max: 2000 }),
    deletionMethod: ensureString(body.deletionMethod, 'deletionMethod', { max: 500 }),
    disclosureNote: ensureString(body.disclosureNote, 'disclosureNote', { max: 2000 }),
    rightsRefusalNote: ensureString(body.rightsRefusalNote, 'rightsRefusalNote', { max: 2000 }),
    securityMeasuresSummary: ensureString(body.securityMeasuresSummary, 'securityMeasuresSummary', { max: 2000 }),
    securityOrg: ensureString(body.securityOrg, 'securityOrg', { max: 1000 }),
    securityTech: ensureString(body.securityTech, 'securityTech', { max: 1000 }),
    securityPhysical: ensureString(body.securityPhysical, 'securityPhysical', { max: 1000 }),
    securityAccessControl: ensureString(body.securityAccessControl, 'securityAccessControl', { max: 1000 }),
    securityUserResponsibility: ensureString(body.securityUserResponsibility, 'securityUserResponsibility', { max: 1000 }),
    securityAudit: ensureString(body.securityAudit, 'securityAudit', { max: 1000 }),
    riskLevel: ensureEnum(body.riskLevel, 'riskLevel', ['LOW', 'MEDIUM', 'HIGH']),
    status: ensureEnum(body.status, 'status', ENTRY_STATUSES),
    reviewDecision: ensureEnum(body.reviewDecision, 'reviewDecision', ['approve', 'reject']),
    reviewNote: ensureString(body.reviewNote, 'reviewNote', { max: 2000 }),
    reviewChecks: body.reviewChecks,
    destructionProofUrl: ensureString(body.destructionProofUrl, 'destructionProofUrl', { max: 10000 }),
    destructionNote: ensureString(body.destructionNote, 'destructionNote', { max: 2000 }),
    destructionConfirmedAt: body.destructionConfirmedAt
  };

  if (payload.reviewChecks != null && !Array.isArray(payload.reviewChecks)) {
    throw badRequest('reviewChecks must be array');
  }
  if (payload.destructionConfirmedAt != null) {
    const dt = new Date(payload.destructionConfirmedAt);
    if (Number.isNaN(dt.getTime())) throw badRequest('destructionConfirmedAt must be ISO datetime');
    payload.destructionConfirmedAt = dt;
  }

  // DPO can only edit review workflow fields
  if (role === 'VIEWER') {
    const dpoOnly = {};
    ['status', 'reviewDecision', 'reviewNote', 'reviewChecks'].forEach((key) => {
      if (payload[key] !== undefined) dpoOnly[key] = payload[key];
    });
    if (Object.keys(dpoOnly).length === 0) throw forbidden();
    return dpoOnly;
  }

  return Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined));
};

const validateSubmitSecurity = (nextData, prevData = null) => {
  const status = nextData.status ?? prevData?.status;
  if (!['PENDING', 'APPROVED', 'COMPLETE'].includes(String(status || '').toUpperCase())) return;

  const securityPhysical = (nextData.securityPhysical ?? prevData?.securityPhysical ?? '').trim();
  const securityOrg = (nextData.securityOrg ?? prevData?.securityOrg ?? '').trim();
  if (!securityPhysical || !securityOrg) {
    throw badRequest('securityPhysical and securityOrg are required before submit/approval');
  }
};

const create = async (req) => {
  const mapped = mapRopaPayload(req.body || {}, { role: req.user.role });
  validateSubmitSecurity(mapped);
  const departmentId = req.body?.departmentId || req.user.departmentId;
  if (!departmentId) throw badRequest('departmentId is required');

  const referenceCode = await nextReferenceCode();
  const result = await prisma.ropaEntry.create({
    data: {
      ...mapped,
      referenceCode,
      createdById: req.user.id,
      departmentId
    }
  });
  await createAuditLog(req.user.id, 'CREATE', 'RopaEntry', result.id, null, result);
  return result;
};

const update = async (req, id) => {
  const oldData = await getOne(req, id);
  if (!oldData) {
    throw notFound('Not found');
  }

  if (req.user.role === 'DEPARTMENT_USER' && oldData.createdById !== req.user.id) {
    throw forbidden();
  }

  const updateData = mapRopaPayload(req.body || {}, { isUpdate: true, role: req.user.role });
  const hasDestructionUpdate =
    updateData.destructionProofUrl !== undefined ||
    updateData.destructionNote !== undefined ||
    updateData.destructionConfirmedAt !== undefined;

  if (req.user.role !== 'VIEWER' && !hasDestructionUpdate) {
    validateSubmitSecurity(updateData, oldData);
  }
  if (hasDestructionUpdate) {
    if (!['COMPLETE', 'APPROVED'].includes(String(oldData.status || '').toUpperCase())) {
      throw badRequest('Destruction confirmation is allowed only for approved/complete records');
    }
    if (!['DEPARTMENT_USER', 'ADMIN'].includes(req.user.role)) {
      throw forbidden();
    }
    if (req.user.role === 'DEPARTMENT_USER' && oldData.createdById !== req.user.id) {
      throw forbidden();
    }
    if (!updateData.destructionConfirmedAt) {
      updateData.destructionConfirmedAt = new Date();
    }
    if (updateData.destructionProofUrl !== undefined && !updateData.destructionProofUrl.trim()) {
      throw badRequest('destructionProofUrl is required');
    }
  }

  const result = await prisma.ropaEntry.update({ where: { id }, data: updateData });
  await createAuditLog(req.user.id, 'UPDATE', 'RopaEntry', id, oldData, result);
  return result;
};

const remove = async (req, id) => {
  const oldData = await getOne(req, id);
  if (!oldData) {
    throw notFound('Not found');
  }
  await prisma.ropaEntry.delete({ where: { id } });
  await createAuditLog(req.user.id, 'DELETE', 'RopaEntry', id, oldData, null);
  return { deleted: true };
};

module.exports = { getAll, getOne, create, update, remove };