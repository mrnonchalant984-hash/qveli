CREATE TABLE "OfficialFeedSource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "feedUrl" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "logoUrl" TEXT,
    "category" TEXT NOT NULL DEFAULT 'NEWS',
    "country" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "sourceType" TEXT NOT NULL DEFAULT 'RSS',
    "trustLevel" TEXT NOT NULL DEFAULT 'VERIFIED',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "syncIntervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "OfficialFeedSource_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OfficialFeedSource_slug_key" ON "OfficialFeedSource"("slug");
CREATE INDEX "OfficialFeedSource_enabled_category_idx" ON "OfficialFeedSource"("enabled", "category");
CREATE INDEX "OfficialFeedSource_lastSyncedAt_idx" ON "OfficialFeedSource"("lastSyncedAt");
ALTER TABLE "OfficialFeedItem" ADD COLUMN "sourceId" TEXT;
ALTER TABLE "OfficialFeedItem" ADD COLUMN "externalId" TEXT;
CREATE UNIQUE INDEX "OfficialFeedItem_sourceId_externalId_key" ON "OfficialFeedItem"("sourceId", "externalId");
ALTER TABLE "OfficialFeedItem" ADD CONSTRAINT "OfficialFeedItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "OfficialFeedSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
