# Qevli V38 — Official Feed Activity Upgrade

Baseline: V37.3 fixed sync.

## Included
- Fixed official-source "Sync all now" by syncing enabled sources with bounded concurrency and per-source timeouts.
- Kept individual source sync behavior.
- Added database-backed reactions, comments, and shares for official feed items.
- Official feed items now carry activity counts and the signed-in user's reaction state.
- Added feed UI actions for Like, reactions, Comment, Share, and View source.
- Added safer official media extraction so ordinary HTML pages are not rendered as images; HTML fallback now extracts real image URLs when available.
- Fixed the dark admin source registry so source rows/forms are readable instead of white-on-white.
- Payments/monetization remain disabled.
- Local storage remains the default; R2/S3 is optional.

## Database
New migration:
`prisma/migrations/20260916090000_official_feed_activity/migration.sql`

## After extracting
Run in PowerShell:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

For terminal official sync, keep Qevli running on `http://localhost:3000` in another terminal, then run:

```powershell
npm run sync:official-feed
```
