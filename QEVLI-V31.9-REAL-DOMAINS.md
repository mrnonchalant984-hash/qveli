# Qevli V31.9 — Real Feature Domains

This release moves Events, Marketplace, Gaming Teams, Tournaments, Saved Items and Memories from generic PlatformRecord storage into dedicated PostgreSQL/Prisma domain models.

## New domain models
- Event / EventAttendee
- MarketplaceListing
- GamingTeam / GamingTeamMember
- Tournament / TournamentRegistration / TournamentMatch
- SavedItem
- Memory

Creator Studio also gets a real 7–90 day analytics endpoint based on posts, reactions, comments and follower activity.

## Migration
Run:
```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Do not use `prisma migrate reset` on a database containing real Qevli accounts/data.

Monetization/payment remains disabled.
