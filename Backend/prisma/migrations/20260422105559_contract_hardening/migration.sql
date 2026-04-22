-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DEPARTMENT_USER', 'VIEWER', 'AUDITOR');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('GENERAL', 'SENSITIVE');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('DRAFT', 'PENDING', 'NEEDS_FIX', 'APPROVED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "RopaRole" AS ENUM ('controller', 'processor');

-- CreateEnum
CREATE TYPE "CollectionMethodType" AS ENUM ('soft', 'hard');

-- CreateEnum
CREATE TYPE "CollectionSource" AS ENUM ('direct', 'other');

-- CreateEnum
CREATE TYPE "StorageDataType" AS ENUM ('soft', 'hard');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('approve', 'reject');

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'DEPARTMENT_USER',
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RopaEntry" (
    "id" TEXT NOT NULL,
    "processName" TEXT NOT NULL,
    "role" "RopaRole" NOT NULL DEFAULT 'controller',
    "purpose" TEXT,
    "personalDataTypes" TEXT[],
    "dataCategory" TEXT,
    "dataType" "DataType" NOT NULL DEFAULT 'GENERAL',
    "dataControllerAddress" TEXT,
    "collectionMethod" TEXT,
    "collectionMethodType" "CollectionMethodType",
    "dataSource" TEXT,
    "collectionSource" "CollectionSource",
    "legalBasis" TEXT,
    "minorConsentUnder10" BOOLEAN,
    "minorConsent10to20" BOOLEAN,
    "crossBorderTransfer" BOOLEAN NOT NULL DEFAULT false,
    "transferCountry" TEXT,
    "transferToAffiliate" BOOLEAN,
    "transferMethod" TEXT,
    "protectionStandard" TEXT,
    "legalExemption28" TEXT,
    "retentionPeriod" TEXT,
    "storageDataType" "StorageDataType",
    "storageMethod" TEXT,
    "rightsAccessNote" TEXT,
    "deletionMethod" TEXT,
    "disclosureNote" TEXT,
    "rightsRefusalNote" TEXT,
    "securityMeasuresSummary" TEXT,
    "securityOrg" TEXT,
    "securityTech" TEXT,
    "securityPhysical" TEXT,
    "securityAccessControl" TEXT,
    "securityUserResponsibility" TEXT,
    "securityAudit" TEXT,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "status" "EntryStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewDecision" "ReviewDecision",
    "reviewNote" TEXT,
    "reviewChecks" JSONB,
    "departmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RopaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RopaEntry" ADD CONSTRAINT "RopaEntry_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RopaEntry" ADD CONSTRAINT "RopaEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
