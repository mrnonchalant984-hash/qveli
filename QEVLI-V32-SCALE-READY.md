# Qevli V32 — Scale-ready realtime foundation

- Presence heartbeat updates both the user's `lastSeenAt` and active web session.
- Realtime polling exposes unread counts and latest activity IDs/timestamps.
- Dashboard presence runs while visible and refreshes social data periodically.
- Notifications refresh while visible.
- Active conversations refresh every 3 seconds; conversation list every 10 seconds while visible.
- Optional BullMQ/Redis queue helper is available for media, notifications, analytics, moderation and recommendations.
- PostgreSQL remains the source of truth.
- Payments and monetization remain disabled.

Run:
```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```
