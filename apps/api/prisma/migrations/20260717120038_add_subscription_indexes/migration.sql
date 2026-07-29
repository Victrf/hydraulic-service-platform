/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId,visitNumber]` on the table `MaintenanceVisit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[equipmentId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "MaintenanceVisit_scheduledDate_idx" ON "MaintenanceVisit"("scheduledDate");

-- CreateIndex
CREATE INDEX "MaintenanceVisit_technicianId_idx" ON "MaintenanceVisit"("technicianId");

-- CreateIndex
CREATE INDEX "MaintenanceVisit_status_idx" ON "MaintenanceVisit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceVisit_subscriptionId_visitNumber_key" ON "MaintenanceVisit"("subscriptionId", "visitNumber");

-- CreateIndex
CREATE INDEX "Subscription_nextVisitDate_idx" ON "Subscription"("nextVisitDate");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_equipmentId_key" ON "Subscription"("equipmentId");
