-- CreateTable
CREATE TABLE "ServiceRequestImage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" UUID NOT NULL,

    CONSTRAINT "ServiceRequestImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceRequestImage_requestId_idx" ON "ServiceRequestImage"("requestId");

-- AddForeignKey
ALTER TABLE "ServiceRequestImage" ADD CONSTRAINT "ServiceRequestImage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
