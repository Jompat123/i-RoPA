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

  console.log('Seed data upserted successfully');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());