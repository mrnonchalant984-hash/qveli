CREATE TABLE "Event" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "location" TEXT,
  "category" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EventAttendee" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'GOING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventAttendee_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MarketplaceListing" (
  "id" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "location" TEXT,
  "category" TEXT,
  "condition" TEXT,
  "imageUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "GamingTeam" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "game" TEXT NOT NULL,
  "region" TEXT,
  "lookingFor" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GamingTeam_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "GamingTeamMember" (
  "id" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'MEMBER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GamingTeamMember_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Tournament" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "game" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "format" TEXT,
  "maxTeams" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TournamentRegistration" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "teamName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TournamentRegistration_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TournamentMatch" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "round" INTEGER NOT NULL,
  "playerAId" TEXT,
  "playerBId" TEXT,
  "scoreA" INTEGER NOT NULL DEFAULT 0,
  "scoreB" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "startsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SavedItem" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "collection" TEXT NOT NULL DEFAULT 'General',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SavedItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Memory" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sourcePostId" TEXT,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "memoryDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EventAttendee_eventId_userId_key" ON "EventAttendee"("eventId","userId");
CREATE INDEX "Event_date_idx" ON "Event"("date");
CREATE INDEX "Event_ownerId_createdAt_idx" ON "Event"("ownerId","createdAt");
CREATE INDEX "EventAttendee_userId_createdAt_idx" ON "EventAttendee"("userId","createdAt");
CREATE INDEX "MarketplaceListing_sellerId_createdAt_idx" ON "MarketplaceListing"("sellerId","createdAt");
CREATE INDEX "MarketplaceListing_status_createdAt_idx" ON "MarketplaceListing"("status","createdAt");
CREATE INDEX "GamingTeam_game_createdAt_idx" ON "GamingTeam"("game","createdAt");
CREATE INDEX "GamingTeam_ownerId_createdAt_idx" ON "GamingTeam"("ownerId","createdAt");
CREATE UNIQUE INDEX "GamingTeamMember_teamId_userId_key" ON "GamingTeamMember"("teamId","userId");
CREATE INDEX "GamingTeamMember_userId_createdAt_idx" ON "GamingTeamMember"("userId","createdAt");
CREATE INDEX "Tournament_game_startDate_idx" ON "Tournament"("game","startDate");
CREATE INDEX "Tournament_ownerId_createdAt_idx" ON "Tournament"("ownerId","createdAt");
CREATE UNIQUE INDEX "TournamentRegistration_tournamentId_userId_key" ON "TournamentRegistration"("tournamentId","userId");
CREATE INDEX "TournamentRegistration_userId_createdAt_idx" ON "TournamentRegistration"("userId","createdAt");
CREATE INDEX "TournamentMatch_tournamentId_round_idx" ON "TournamentMatch"("tournamentId","round");
CREATE UNIQUE INDEX "SavedItem_userId_sourceType_sourceId_key" ON "SavedItem"("userId","sourceType","sourceId");
CREATE INDEX "SavedItem_userId_collection_createdAt_idx" ON "SavedItem"("userId","collection","createdAt");
CREATE INDEX "Memory_userId_memoryDate_idx" ON "Memory"("userId","memoryDate");
ALTER TABLE "Event" ADD CONSTRAINT "Event_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GamingTeam" ADD CONSTRAINT "GamingTeam_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GamingTeamMember" ADD CONSTRAINT "GamingTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "GamingTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GamingTeamMember" ADD CONSTRAINT "GamingTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_playerAId_fkey" FOREIGN KEY ("playerAId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_playerBId_fkey" FOREIGN KEY ("playerBId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SavedItem" ADD CONSTRAINT "SavedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
