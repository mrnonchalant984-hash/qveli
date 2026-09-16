# Qevli V11-V20 — Complete Social Platform Suite

This build extends Qevli V10 into the planned V11-V20 roadmap while preserving the existing authentication, PostgreSQL/Prisma backend, groups, calls, live infrastructure, Qviews, creator mode, moderation, search and mobile-first dashboard.

## Included roadmap
- V11 Connections: friend requests, accept/decline/remove, friends list.
- V12 Events: create and discover events with date/location metadata.
- V13 Qevli Video: dedicated video discovery from video posts.
- V14 Marketplace: Nigeria-first listing creation with price/location metadata.
- V15 Qevli AI: provider-backed AI endpoint with web-search fallback.
- V16 Creator Studio: existing professional mode, goals and verification controls.
- V17 Qevli Gaming: teams and tournament records.
- V18 Security & Trust: privacy preference storage plus existing block/report/admin moderation.
- V19 Discovery Engine: existing search + follow-aware feed; video/discovery surfaces added.
- V20 Scale foundation: indexed feature records, API separation, media/call/live services and a clear path to Redis/queues/CDN/observability.

## Run
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev

Never use `npx prisma migrate reset` on a database containing real Qevli data.

## Optional AI
Set OPENAI_API_KEY and OPENAI_MODEL for full AI answers. If the key is blank, Qevli AI falls back to the existing web-search provider configuration.

## Real media
Set the LiveKit variables from V10 for voice/video/live. Production file uploads should use durable object storage/CDN rather than the local Vercel filesystem.

## Production scaling next
Use Redis for presence/rate limits/caching, a queue for notifications/media processing, object storage + CDN for uploads, Postgres connection pooling/read replicas as needed, WebSocket/realtime infrastructure, centralized logs/error tracking, backups, WAF/rate limiting and automated moderation.
