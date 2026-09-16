CREATE TABLE "FeedActivity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "reactionType" TEXT,
  "text" TEXT,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeedActivity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FeedActivity_targetType_targetId_createdAt_idx" ON "FeedActivity"("targetType", "targetId", "createdAt");
CREATE INDEX "FeedActivity_userId_targetType_targetId_action_idx" ON "FeedActivity"("userId", "targetType", "targetId", "action");
CREATE INDEX "FeedActivity_parentId_createdAt_idx" ON "FeedActivity"("parentId", "createdAt");
ALTER TABLE "FeedActivity" ADD CONSTRAINT "FeedActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedActivity" ADD CONSTRAINT "FeedActivity_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "FeedActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
