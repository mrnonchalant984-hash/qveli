# Qevli V35 — Live Social Feed

V35 adds the next production feed layer without changing the existing public-feed behavior.

## Included
- live/new-post detection with refresh banner
- cursor-based infinite scrolling
- ranking using freshness, engagement, friend/follow affinity and repost activity
- inline comments and one-level replies
- reaction picker
- persistent share notifications
- real reposts with notifications
- image/video posts through the existing upload pipeline
- friend/people recommendations
- hashtag trending panel
- Qviews official posts in the feed
- automatic official-source synchronization for OpenAI, FIFA, NBA and Spain Football/RFEF
- Vercel cron every 30 minutes for official-source refresh
- existing Qevli search across people, posts, official pages and web knowledge
- responsive mobile feed layout

## Database
Run migrations without resetting data:

```powershell
npx prisma generate
npx prisma migrate deploy
```

The new migration is `20260915130000_feed_realtime_reposts_comments`.

## Local run
```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Optional manual official-feed refresh while the app is running:
```powershell
npm run sync:official-feed
```

## Production automatic refresh
`vercel.json` schedules `/api/official-feed/sync` every 30 minutes. If `QEVLI_CRON_SECRET` is set, the route accepts the Vercel cron Authorization Bearer secret or the local `x-qevli-cron` header.

## Important
Do not run `prisma migrate reset` on the real database.
