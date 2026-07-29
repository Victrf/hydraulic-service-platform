/*
  Warnings:

  - You are about to drop the column `notes` on the `ServiceReport` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `ServiceReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceReport" DROP COLUMN "notes",
ADD COLUMN     "areaCleaned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "customerAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customerInformed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "equipmentTested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "findings" TEXT,
ADD COLUMN     "operational" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recommendations" TEXT,
ADD COLUMN     "rootCause" TEXT,
ADD COLUMN     "safetyChecks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workPerformed" TEXT;
