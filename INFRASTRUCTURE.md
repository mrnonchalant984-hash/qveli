# Qevli V10 infrastructure

Qevli is split into four infrastructure layers:

1. **Next.js application** — web UI and server-side API routes. Suitable for Vercel.
2. **PostgreSQL + Prisma** — durable accounts, profiles, posts, messages, groups, calls, live-stream records and moderation data.
3. **LiveKit** — real-time WebRTC transport for voice calls, video calls and live video rooms. Qevli never puts LiveKit API secrets in the browser; `/api/livekit/token` issues short-lived room tokens after checking the PostgreSQL permissions.
4. **Media storage** — production uploads should use Cloudinary or S3-compatible object storage. The local `public/uploads` directory is only a development fallback and is not durable on Vercel.

## LiveKit setup

Create a LiveKit Cloud project (or run your own LiveKit server) and put these values in `.env.local`:

```env
NEXT_PUBLIC_LIVEKIT_URL="wss://YOUR_PROJECT.livekit.cloud"
LIVEKIT_API_KEY="your-api-key"
LIVEKIT_API_SECRET="your-api-secret"
```

Then install dependencies and run:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

### Room security

- Calls use rooms named `qevli-call-{callId}`.
- Live streams use rooms named `qevli-live-{streamId}`.
- The token API verifies that the signed-in user belongs to the call.
- Only the live-stream host receives publish permission.
- Live viewers receive subscribe-only permission.
- LiveKit credentials are server-only.

## Production architecture

Recommended deployment:

- **Web/API:** Vercel
- **Database:** managed PostgreSQL (Neon, Supabase, or another PostgreSQL provider)
- **Voice/video/live:** LiveKit Cloud
- **Images/video/files:** Cloudinary or S3 + CDN
- **Realtime fan-out/presence:** add Ably/Pusher or a dedicated realtime service when Qevli needs instant message/notification delivery without polling
- **Background work:** a queue/job service for video processing, notifications, moderation and analytics as traffic grows
- **Monitoring:** error tracking + uptime checks + structured server logs

## Important

The browser cannot carry the media by itself just because a database row exists. LiveKit is the media transport layer. The database records who may join and the lifecycle of the Qevli call/live session.
