# Qevli production readiness

## Runtime services
- PostgreSQL: Neon via `DATABASE_URL`.
- Object storage: Supabase Storage. Server-side REST uploads use `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.
- Direct S3-compatible uploads: Supabase Storage S3 endpoint can be supplied through `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`.
- Redis: Upstash REST for cache/rate limits and Redis protocol `REDIS_URL` for BullMQ workers.
- Realtime media: LiveKit through `NEXT_PUBLIC_LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.
- Email: Resend or SMTP.
- Billing: Monnify sandbox code remains available, but `QEVLI_MONETIZATION_ENABLED=false` by default.

## Required production secrets
Set a strong random `AUTH_SECRET` (at least 32 characters), Neon `DATABASE_URL`, Supabase storage credentials, Redis credentials, and LiveKit credentials before enabling those services. Do not use placeholder values.

## Cron
Set `CRON_SECRET` in the deployment environment. Vercel Cron can send it as a Bearer authorization header to `/api/official-feed/sync`.

## Worker
Run `npm run worker` as a separate long-running process using the same Neon and Redis credentials as the web application.

## Verification
Run:

```bash
npm ci
npm run test
npm run build
```
