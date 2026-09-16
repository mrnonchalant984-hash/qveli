-- Profile boost checkout and admin approval workflow
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileBoostedUntil" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "ProfileBoost" (
  "id" TEXT NOT NULL,
  "targetUserId" TEXT NOT NULL,
  "requesterUserId" TEXT,
  "planCode" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "amountMinor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "provider" TEXT,
  "providerRef" TEXT,
  "randomCode" TEXT NOT NULL DEFAULT '',
  "approvedByUserId" TEXT,
  "approvedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfileBoost_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProfileBoost_targetUserId_status_idx" ON "ProfileBoost"("targetUserId", "status");
CREATE INDEX IF NOT EXISTS "ProfileBoost_status_createdAt_idx" ON "ProfileBoost"("status", "createdAt");
ALTER TABLE "ProfileBoost" ADD CONSTRAINT "ProfileBoost_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProfileBoost" ADD CONSTRAINT "ProfileBoost_requesterUserId_fkey" FOREIGN KEY ("requesterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
