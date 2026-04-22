const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // หาหรือสร้าง departments
  let itDept = await prisma.department.findFirst({ where: { name: 'IT Department' } });
  if (!itDept) {
    itDept = await prisma.department.create({
      data: {
        name: 'IT Department',
        description: 'Information Technology'
      }
    });
  }

  let hrDept = await prisma.department.findFirst({ where: { name: 'HR Department' } });
  if (!hrDept) {
    hrDept = await prisma.department.create({
      data: {
        name: 'HR Department',
        description: 'Human Resources'
      }
    });
  }

  // หาหรือสร้าง users (อัปเดตถ้ามีอยู่แล้ว)
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@i-ropa.local' },
    update: {
      name: 'ผู้ดูแลระบบ',
      role: 'ADMIN',
      passwordHash
    },
    create: {
      name: 'ผู้ดูแลระบบ',
      email: 'admin@i-ropa.local',
      passwordHash,
      role: 'ADMIN'
    }
  });

  await prisma.user.upsert({
    where: { email: 'dpo@i-ropa.local' },
    update: {
      name: 'เจ้าหน้าที่ DPO',
      role: 'VIEWER',
      passwordHash
    },
    create: {
      name: 'เจ้าหน้าที่ DPO',
      email: 'dpo@i-ropa.local',
      passwordHash,
      role: 'VIEWER'
    }
  });

  await prisma.user.upsert({
    where: { email: 'owner@i-ropa.local' },
    update: {
      name: 'เจ้าของข้อมูล',
      role: 'DEPARTMENT_USER',
      departmentId: itDept.id,
      passwordHash
    },
    create: {
      name: 'เจ้าของข้อมูล',
      email: 'owner@i-ropa.local',
      passwordHash,
      role: 'DEPARTMENT_USER',
      departmentId: itDept.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'auditor@i-ropa.local' },
    update: {
      name: 'ผู้ตรวจสอบระบบ',
      role: 'AUDITOR',
      departmentId: hrDept.id,
      passwordHash
    },
    create: {
      name: 'ผู้ตรวจสอบระบบ',
      email: 'auditor@i-ropa.local',
      passwordHash,
      role: 'AUDITOR',
      departmentId: hrDept.id
    }
  });

  const owner = await prisma.user.findUnique({
    where: { email: 'owner@i-ropa.local' },
    select: { id: true, departmentId: true }
  });

  if (owner?.departmentId) {
    const existingRopaCount = await prisma.ropaEntry.count({
      where: { createdById: owner.id }
    });

    if (existingRopaCount === 0) {
      await prisma.ropaEntry.createMany({
        data: [
          {
            processName: 'การจัดการพนักงานใหม่',
            role: 'controller',
            purpose: 'จัดเก็บและบริหารข้อมูลพนักงานใหม่',
            personalDataTypes: ['ชื่อ', 'อีเมล', 'เบอร์โทรศัพท์'],
            dataCategory: 'ข้อมูลส่วนบุคคลทั่วไป',
            dataType: 'GENERAL',
            dataControllerAddress: 'สำนักงานใหญ่ กรุงเทพฯ',
            collectionMethod: 'DIRECT|SOFT',
            collectionMethodType: 'soft',
            dataSource: 'พนักงาน',
            collectionSource: 'direct',
            legalBasis: 'CONSENT',
            minorConsentUnder10: false,
            minorConsent10to20: false,
            crossBorderTransfer: false,
            transferCountry: null,
            transferToAffiliate: false,
            transferMethod: null,
            protectionStandard: null,
            legalExemption28: null,
            retentionPeriod: '5 ปี',
            storageDataType: 'soft',
            storageMethod: 'ฐานข้อมูลภายใน',
            rightsAccessNote: 'เจ้าของข้อมูลร้องขอผ่าน HR Service Desk',
            deletionMethod: 'ลบจากระบบตามรอบการทำลายข้อมูล',
            disclosureNote: 'เปิดเผยเฉพาะฝ่ายที่เกี่ยวข้อง',
            rightsRefusalNote: 'กรณีจำเป็นตามกฎหมายแรงงาน',
            securityMeasuresSummary: 'MFA และ RBAC',
            securityOrg: 'กำหนดบทบาทหน้าที่ผู้ใช้งาน',
            securityTech: 'MFA, Encryption at rest',
            securityPhysical: 'ควบคุมการเข้าออกห้อง Server',
            securityAccessControl: 'Role-based access control',
            securityUserResponsibility: 'ผู้ใช้งานลงนามการรักษาความลับ',
            securityAudit: 'ตรวจสอบสิทธิรายไตรมาส',
            riskLevel: 'LOW',
            status: 'APPROVED',
            departmentId: owner.departmentId,
            createdById: owner.id
          },
          {
            processName: 'ระบบรับสมัครงานออนไลน์',
            role: 'controller',
            purpose: 'จัดการผู้สมัครงาน',
            personalDataTypes: ['ชื่อ', 'อีเมล', 'ประวัติการศึกษา'],
            dataCategory: 'ข้อมูลส่วนบุคคลทั่วไป',
            dataType: 'SENSITIVE',
            dataControllerAddress: 'สำนักงานใหญ่ กรุงเทพฯ',
            collectionMethod: 'DIRECT|SOFT',
            collectionMethodType: 'soft',
            dataSource: 'ผู้สมัครงาน',
            collectionSource: 'direct',
            legalBasis: 'LEGITIMATE_INTEREST',
            minorConsentUnder10: false,
            minorConsent10to20: false,
            crossBorderTransfer: true,
            transferCountry: 'Singapore',
            transferToAffiliate: true,
            transferMethod: 'API Gateway',
            protectionStandard: 'Contractual Clauses',
            legalExemption28: 'N/A',
            retentionPeriod: '2 ปี',
            storageDataType: 'soft',
            storageMethod: 'Cloud Storage',
            rightsAccessNote: 'ส่งคำร้องผ่านอีเมล DPO',
            deletionMethod: 'ลบถาวรเมื่อพ้นระยะเวลา',
            disclosureNote: 'เปิดเผยให้ผู้ว่าจ้างที่ได้รับอนุมัติ',
            rightsRefusalNote: null,
            securityMeasuresSummary: 'DLP และ Log monitoring',
            securityOrg: 'มีการอบรม PDPA รายปี',
            securityTech: 'SIEM, Endpoint protection',
            securityPhysical: 'Data center ตามมาตรฐาน ISO 27001',
            securityAccessControl: 'Least privilege',
            securityUserResponsibility: 'เจ้าของระบบตรวจสอบสิทธิรายเดือน',
            securityAudit: 'Internal audit ทุก 6 เดือน',
            riskLevel: 'MEDIUM',
            status: 'PENDING',
            departmentId: owner.departmentId,
            createdById: owner.id
          },
          {
            processName: 'งาน Outsource Payroll',
            role: 'processor',
            purpose: 'ประมวลผลข้อมูลเงินเดือน',
            personalDataTypes: ['ชื่อ', 'เลขบัตรประชาชน', 'เลขบัญชี'],
            dataCategory: 'ข้อมูลส่วนบุคคลอ่อนไหว',
            dataType: 'SENSITIVE',
            dataControllerAddress: 'สำนักงานใหญ่ กรุงเทพฯ',
            collectionMethod: 'OTHER|HARD',
            collectionMethodType: 'hard',
            dataSource: 'บริษัทคู่สัญญา',
            collectionSource: 'other',
            legalBasis: 'CONTRACT',
            minorConsentUnder10: false,
            minorConsent10to20: false,
            crossBorderTransfer: false,
            transferCountry: null,
            transferToAffiliate: false,
            transferMethod: null,
            protectionStandard: null,
            legalExemption28: null,
            retentionPeriod: '10 ปี',
            storageDataType: 'hard',
            storageMethod: 'แฟ้มเอกสารเข้าตู้ล็อก',
            rightsAccessNote: 'ติดต่อผ่านนายจ้างต้นทาง',
            deletionMethod: 'ทำลายเอกสารโดยเครื่องทำลาย',
            disclosureNote: null,
            rightsRefusalNote: null,
            securityMeasuresSummary: 'Access control + NDA',
            securityOrg: 'กำหนดผู้รับผิดชอบข้อมูลประจำระบบ',
            securityTech: 'N/A',
            securityPhysical: 'ตู้นิรภัยเอกสาร',
            securityAccessControl: 'เฉพาะเจ้าหน้าที่ที่ได้รับมอบหมาย',
            securityUserResponsibility: 'ลงชื่อรับ-ส่งเอกสารทุกครั้ง',
            securityAudit: 'ตรวจนับเอกสารรายเดือน',
            riskLevel: 'HIGH',
            status: 'NEEDS_FIX',
            reviewDecision: 'reject',
            reviewNote: 'กรุณาระบุมาตรการทางเทคนิคเพิ่มเติม',
            departmentId: owner.departmentId,
            createdById: owner.id
          }
        ]
      });
    }
  }

  console.log('Seed data upserted successfully');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());