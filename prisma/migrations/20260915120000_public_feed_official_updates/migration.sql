-- Public feed + curated external official-source updates + real post shares
ALTER TABLE "CompanyUpdate" ADD COLUMN IF NOT EXISTS "sourceName" TEXT;
ALTER TABLE "CompanyUpdate" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT;

CREATE TABLE IF NOT EXISTS "OfficialFeedItem" (
  "id" TEXT NOT NULL,
  "sourceName" TEXT NOT NULL,
  "sourceHandle" TEXT,
  "sourceUrl" TEXT NOT NULL,
  "logoUrl" TEXT,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "mediaUrl" TEXT,
  "mediaType" TEXT,
  "category" TEXT NOT NULL DEFAULT 'NEWS',
  "publishedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OfficialFeedItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OfficialFeedItem_publishedAt_idx" ON "OfficialFeedItem"("publishedAt");
CREATE INDEX IF NOT EXISTS "OfficialFeedItem_category_publishedAt_idx" ON "OfficialFeedItem"("category", "publishedAt");

CREATE TABLE IF NOT EXISTS "PostShare" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostShare_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "PostShare_postId_userId_key" ON "PostShare"("postId", "userId");
CREATE INDEX IF NOT EXISTS "PostShare_postId_createdAt_idx" ON "PostShare"("postId", "createdAt");
CREATE INDEX IF NOT EXISTS "PostShare_userId_createdAt_idx" ON "PostShare"("userId", "createdAt");
ALTER TABLE "PostShare" ADD CONSTRAINT "PostShare_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostShare" ADD CONSTRAINT "PostShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
