CREATE TABLE "CompanyUpdate" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "mediaUrl" TEXT,
  "mediaType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyUpdate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CompanyUpdate_companyId_createdAt_idx" ON "CompanyUpdate"("companyId", "createdAt");

ALTER TABLE "CompanyUpdate" ADD CONSTRAINT "CompanyUpdate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
