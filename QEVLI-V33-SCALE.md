# Qevli V33 — Scale, Ranking, Media, Moderation & Delivery

V33 builds the next production-oriented layer without changing the payment/monetization state.

## Feed ranking
- `/api/posts` now ranks a candidate window using recency, reactions/comments, follow relationship, and verification.
- Blocked users are excluded.
- First-page personalized feeds can use Upstash Redis for a short 20-second cache.
- The feed remains PostgreSQL-backed; Redis is an acceleration layer, not the source of truth.

## Recommendations
- `/api/recommendations` ranks people and public posts using relationship, engagement and freshness signals.
- `RecommendationFeedback` can suppress content after user feedback.
- Results are cached briefly in Redis.

## Media
- `/api/uploads` records every uploaded asset in `MediaAsset`.
- If S3-compatible object storage is configured, media is stored there with immutable cache headers.
- Otherwise local development falls back to `public/uploads`.
- A durable `qevli-media` job is queued for downstream processing.
- Production media processing should run in the worker tier, not inside the web request.

## Moderation
- New posts queue a moderation scan.
- The worker has a small safety-rule layer that creates a moderation case for clearly suspicious phrases.
- This is a first-pass safety net, not a replacement for a trained moderation model and human review.
- Existing report, moderation-case and appeal APIs remain the source of moderation workflow.

## Notification delivery
- In-app notifications are persisted immediately in PostgreSQL.
- Notification delivery jobs are queued after persistence.
- Optional push/email providers can be attached to the worker without blocking the request path.

## Rate limiting
- API write paths can use Redis-backed distributed rate limiting when Upstash is configured.
- Local in-memory limiting remains the development fallback.

## Production topology
Recommended progression:

1. Next.js web/API instances behind a managed load balancer/CDN.
2. Managed PostgreSQL with automated backups, connection pooling and read replicas when needed.
3. Upstash Redis or another managed Redis for cache, rate limits and short-lived realtime state.
4. S3-compatible object storage + CDN for images/videos.
5. Separate BullMQ worker service for media, moderation, analytics, recommendations and notification delivery.
6. Managed logging/error tracking/tracing.
7. Scheduled cleanup jobs for expired stories, old sessions, stale caches and failed background jobs.

Do not treat a single Vercel function instance, local filesystem or in-memory Map as durable production infrastructure.

## Environment
See `.env.example` for Redis, S3/CDN, search, email, Twilio and LiveKit settings.

Payments/monetization remain disabled until explicitly enabled.
