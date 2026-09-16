# Qevli V36 — Automatic Official Source Engine

V36 expands the official feed from a fixed list into a database-backed source registry.

## Included
- OfficialFeedSource registry with category, website, feed URL, country, type, trust level and sync status.
- Curated sources across world news, Nigeria, business/economics, technology, AI, science/space, health, developers, startups, gaming, football, basketball, motorsport and more.
- RSS/Atom parsing with controlled HTML fallback for sources that do not expose a feed.
- Deduplicated OfficialFeedItem records tied to their source.
- Short attributed summaries and direct links to the original publisher.
- Admin source manager: add, enable and disable sources.
- Existing V35 feed ranking and public-feed behavior remain intact.
- Existing Qviews native official updates remain separate from external-source cards.

## Install
```powershell
cd C:\Users\MFONOBONG\Desktop\QEVLI
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed:official-sources
npm run dev
```

Optional manual sync:
```powershell
npm run sync:official-feed
```

Production uses the existing Vercel cron endpoint every 30 minutes. The synchronizer reads enabled sources from the database, so adding a source in Admin makes it eligible for future syncs without editing the code.

## Content/attribution rule
External sources are shown as official-source updates, not as posts authored by the external organization on Qevli. Qevli stores a short summary and the canonical source link rather than copying an entire article.

Never run `prisma migrate reset` on the real database.
