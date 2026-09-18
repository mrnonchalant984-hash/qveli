CREATE TYPE "OnboardingSource" AS ENUM ('SCHOOL', 'FRIEND', 'GOOGLE', 'TIKTOK', 'INSTAGRAM', 'TWITTER', 'AI', 'OTHER');
CREATE TYPE "FeatureRequestCategory" AS ENUM ('BUG', 'FEATURE', 'IMPROVEMENT');
CREATE TYPE "FeatureRequestStatus" AS ENUM ('REQUESTED', 'PLANNED', 'IN_PROGRESS', 'DONE');

CREATE TABLE "OnboardingSurvey" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "source" "OnboardingSource" NOT NULL,
  "otherText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OnboardingSurvey_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OnboardingSurvey_userId_key" ON "OnboardingSurvey"("userId");
CREATE INDEX "OnboardingSurvey_source_createdAt_idx" ON "OnboardingSurvey"("source", "createdAt");
ALTER TABLE "OnboardingSurvey" ADD CONSTRAINT "OnboardingSurvey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FeatureRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" "FeatureRequestCategory" NOT NULL DEFAULT 'FEATURE',
  "status" "FeatureRequestStatus" NOT NULL DEFAULT 'REQUESTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FeatureRequest_status_createdAt_idx" ON "FeatureRequest"("status", "createdAt");
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FeatureRequestVote" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeatureRequestVote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FeatureRequestVote_requestId_userId_key" ON "FeatureRequestVote"("requestId", "userId");
CREATE INDEX "FeatureRequestVote_userId_createdAt_idx" ON "FeatureRequestVote"("userId", "createdAt");
ALTER TABLE "FeatureRequestVote" ADD CONSTRAINT "FeatureRequestVote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeatureRequestVote" ADD CONSTRAINT "FeatureRequestVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
