ALTER TABLE "User" ADD COLUMN "professionalMode" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "verifiedAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN "mediaUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN "mediaType" TEXT;
ALTER TABLE "Story" ADD COLUMN "mediaType" TEXT;
ALTER TABLE "Message" ADD COLUMN "mediaType" TEXT;
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CompanyFollow" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyFollow_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");
CREATE UNIQUE INDEX "CompanyFollow_companyId_userId_key" ON "CompanyFollow"("companyId", "userId");
CREATE INDEX "CompanyFollow_companyId_idx" ON "CompanyFollow"("companyId");
CREATE INDEX "CompanyFollow_userId_idx" ON "CompanyFollow"("userId");
ALTER TABLE "CompanyFollow" ADD CONSTRAINT "CompanyFollow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyFollow" ADD CONSTRAINT "CompanyFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
