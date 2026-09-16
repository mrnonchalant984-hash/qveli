CREATE TABLE "AdminAuthCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt" TIMESTAMP(3),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuthCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminAuthCode_userId_expiresAt_idx" ON "AdminAuthCode"("userId", "expiresAt");
ALTER TABLE "AdminAuthCode" ADD CONSTRAINT "AdminAuthCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
