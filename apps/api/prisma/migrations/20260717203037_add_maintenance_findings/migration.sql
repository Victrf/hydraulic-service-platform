-- CreateTable
CREATE TABLE "MaintenanceFinding" (
    "id" UUID NOT NULL,
    "maintenanceVisitId" UUID NOT NULL,
    "problem" TEXT NOT NULL,
    "cause" TEXT,
    "condition" TEXT,
    "recommendation" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceFindingImage" (
    "id" UUID NOT NULL,
    "findingId" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceFindingImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MaintenanceFinding" ADD CONSTRAINT "MaintenanceFinding_maintenanceVisitId_fkey" FOREIGN KEY ("maintenanceVisitId") REFERENCES "MaintenanceVisit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceFindingImage" ADD CONSTRAINT "MaintenanceFindingImage_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "MaintenanceFinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
