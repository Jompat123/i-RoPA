-- AlterTable
ALTER TABLE "RopaEntry" ADD COLUMN     "destructionConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "destructionNote" TEXT,
ADD COLUMN     "destructionProofUrl" TEXT;
