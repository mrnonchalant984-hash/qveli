# Qevli V31 — Distributed Scale Foundation

V31 upgrades the V1–V30 Qevli platform with the missing production-scale architecture pieces:

- Redis REST cache/rate-limit foundation via Upstash
- Redis protocol connection for BullMQ workers
- Durable background job queues and worker process
- Redis Streams event bus foundation
- S3-compatible object storage abstraction (Cloudflare R2 recommended)
- CDN-backed media URL abstraction
- Presigned upload URL endpoint
- Outbox/event foundation in PostgreSQL
- Region/read-region configuration
- Scale readiness endpoint
- Monetization remains OFF

## Important

V31 is a scalable architecture foundation, not a claim that Qevli is already operating at Facebook-scale traffic. Actual scale comes from deployment, load tests, capacity planning, monitoring, multi-region infrastructure and real traffic.

## Install

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
```

## Run web app

```powershell
npm run dev
```

## Run workers

In another PowerShell window:

```powershell
npm run worker
```

## Required V31 environment variables

```env
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
REDIS_URL=""
S3_ENDPOINT="https://ACCOUNT_ID.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="qevli-media"
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
CDN_BASE_URL="https://cdn.qevli.com"
QEVLI_REGION="local"
QEVLI_PRIMARY_REGION="local"
QEVLI_READ_REGIONS=""
```

## Service roles

- `UPSTASH_REDIS_REST_*`: Next.js/serverless cache, rate limiting and event-stream operations.
- `REDIS_URL`: BullMQ worker connection. Upstash provides a `rediss://...` connection string.
- `S3_*`: private server-side credentials for Cloudflare R2 or another S3-compatible provider.
- `CDN_BASE_URL`: public media delivery domain, ideally a Cloudflare custom domain attached to the R2 bucket.

Never put `UPSTASH_REDIS_REST_TOKEN`, `REDIS_URL`, or `S3_SECRET_ACCESS_KEY` in browser/client code or `NEXT_PUBLIC_*` variables.

## V31 architecture

```text
Clients
  -> Next.js/API
      -> Redis REST (cache/rate limits/events)
      -> PostgreSQL (source of truth + outbox)
      -> BullMQ/Redis -> background workers
      -> R2/S3 -> CDN -> media clients
      -> LiveKit -> realtime audio/video

Multi-region readiness:
  primary region + read regions + region-aware events/outbox
```
