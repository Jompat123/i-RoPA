-- AlterTable
ALTER TABLE "RopaEntry" ADD COLUMN     "referenceCode" TEXT;
ALTER TABLE "RopaEntry" ADD COLUMN     "minorConsentOtherNote" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RopaEntry_referenceCode_key" ON "RopaEntry"("referenceCode");
