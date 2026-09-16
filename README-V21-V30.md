# Qevli V21–V30

This build extends Qevli V20 with the V21–V30 platform layer.

## Included
- V21 Authentication & security: verification/reset token infrastructure, DB sessions, password change, security audit events, notification preferences, account export/delete, 2FA readiness.
- V22 Realtime: presence heartbeat and notification/message polling foundation.
- V23 Payments: subscription/payment models, plans and webhook foundation. **Monetization is disabled by default.**
- V24 Media: media asset registry, storage/CDN readiness.
- V25 AI & discovery: recommendations and feedback foundation, existing Qevli AI retained.
- V26 Trust & safety: moderation cases and appeals.
- V27 Business/ads: business-page API and advertising code path. **Advertising is disabled.**
- V28 Low-data/accessibility: data-saver/platform settings, PWA service worker and manifest foundation.
- V29 Analytics: event tracking and admin analytics.
- V30 Infrastructure: health checks, feature flags, storage/cache readiness and production configuration surface.

## Monetization safety
The following defaults are intentionally OFF:

```env
QEVLI_MONETIZATION_ENABLED="true" # Monnify sandbox only; use false until credentials and webhook are configured
QEVLI_EMAIL_ENABLED="false"
QEVLI_PUSH_ENABLED="false"
```

The subscription/payment/webhook/ads code remains in the project for future use, but server-side endpoints reject live transactions while monetization is disabled.

## Run

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Do not run `npx prisma migrate reset` on a database containing your existing Qevli account/data.

## Production services
Set up external services only when ready:
- LiveKit for calls/live
- Cloudinary or S3-compatible storage + CDN for durable media
- Redis/Upstash for distributed cache/rate limits/queues
- Email provider for verification/reset mail
- Push provider/browser VAPID setup for push notifications
- Observability/error tracking and backups

The app is designed so these can be enabled through environment configuration rather than rewriting the social product.
