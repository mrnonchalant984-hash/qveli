# Qevli V33 — Scale, realtime observability and admin host

## Added
- Ranked `/api/feed` using freshness, friend/follow affinity and engagement.
- Redis feed caching when Redis is configured; PostgreSQL remains the source of truth.
- Presence heartbeats are recorded as analytics events.
- `/api/dashboard/pulse` provides authenticated network pulse metrics.
- `/api/admin/network` provides admin-only infrastructure/network analysis.
- Dashboard shows live network pulse and flow.
- Admin center shows active users/sessions, heartbeats, events, posts, messages, queue backlog, moderation backlog, DB latency and service readiness.
- Media processing jobs are queued through the existing BullMQ boundary.
- Notification delivery jobs are queued through the existing BullMQ boundary.
- `admin-host/` provides a separate local admin gateway on port 3001.

## Local admin host
Run the main app on port 3000, then in another terminal run:

`npm run admin:dev`

Open `http://localhost:3001`. It redirects to the protected Qevli Admin center at the main application.

## Production architecture
Use a separate admin hostname (for example `admin.qevli...`) mapped to the admin host/deployment, while keeping the main application/API separate. Redis/BullMQ, object storage/CDN, background workers and PostgreSQL can be scaled independently.

Payments and monetization remain disabled.
