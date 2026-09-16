CREATE TABLE "OfficialFeedReaction" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "ReactionType" NOT NULL DEFAULT 'LIKE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfficialFeedReaction_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OfficialFeedComment" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfficialFeedComment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "OfficialFeedShare" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfficialFeedShare_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OfficialFeedReaction_itemId_userId_key" ON "OfficialFeedReaction"("itemId", "userId");
CREATE INDEX "OfficialFeedReaction_itemId_type_idx" ON "OfficialFeedReaction"("itemId", "type");
CREATE INDEX "OfficialFeedComment_itemId_createdAt_idx" ON "OfficialFeedComment"("itemId", "createdAt");
CREATE INDEX "OfficialFeedComment_userId_createdAt_idx" ON "OfficialFeedComment"("userId", "createdAt");
CREATE UNIQUE INDEX "OfficialFeedShare_itemId_userId_key" ON "OfficialFeedShare"("itemId", "userId");
CREATE INDEX "OfficialFeedShare_itemId_createdAt_idx" ON "OfficialFeedShare"("itemId", "createdAt");
CREATE INDEX "OfficialFeedShare_userId_createdAt_idx" ON "OfficialFeedShare"("userId", "createdAt");
ALTER TABLE "OfficialFeedReaction" ADD CONSTRAINT "OfficialFeedReaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "OfficialFeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficialFeedReaction" ADD CONSTRAINT "OfficialFeedReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficialFeedComment" ADD CONSTRAINT "OfficialFeedComment_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "OfficialFeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficialFeedComment" ADD CONSTRAINT "OfficialFeedComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficialFeedShare" ADD CONSTRAINT "OfficialFeedShare_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "OfficialFeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OfficialFeedShare" ADD CONSTRAINT "OfficialFeedShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
