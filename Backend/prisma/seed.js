const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create departments
  const itDept = await prisma.department.create({
    data: {
      name: 'IT Department',
      description: 'Information Technology'
    }
  });

  const hrDept = await prisma.department.create({
    data: {
      name: 'HR Department',
      description: 'Human Resources'
    }
  });

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@test.com',
      passwordHash,
      role: 'ADMIN'
    }
  });

  await prisma.user.create({
    data: {
      name: 'IT Staff',
      email: 'it@test.com',
      passwordHash,
      role: 'DEPARTMENT_USER',
      departmentId: itDept.id
    }
  });

  await prisma.user.create({
    data: {
      name: 'HR Staff',
      email: 'hr@test.com',
      passwordHash,
      role: 'DEPARTMENT_USER',
      departmentId: hrDept.id
    }
  });

  await prisma.user.create({
    data: {
      name: 'Viewer User',
      email: 'viewer@test.com',
      passwordHash,
      role: 'VIEWER'
    }
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());