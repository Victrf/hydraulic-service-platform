-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN     "hiddenAt" TIMESTAMP(3),
ADD COLUMN     "isHiddenByUser" BOOLEAN NOT NULL DEFAULT false;
