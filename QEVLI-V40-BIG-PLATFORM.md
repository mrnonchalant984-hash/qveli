# Qevli V40 — Big Platform UI Foundation

V40 is based directly on QEVLI-V39-SMOOTH-PLATFORM. This release focuses on making Qevli feel like one large social platform rather than a collection of feature pages.

## Included
- Desktop-style left navigation with core destinations.
- Global search entry point in the top bar.
- Notifications and messages quick actions.
- Responsive mobile bottom navigation retained.
- Branded Qevli shell and active navigation states.
- Dashboard-first information hierarchy.
- Existing V39 APIs, database, auth, moderation, storage abstraction, worker, LiveKit, and disabled monetization are preserved.

## Important
- Payments/monetization remain disabled.
- No Cloudflare R2 card is required; keep the existing storage fallback.
- Keep local and production environment files/configuration.

## Run
```powershell
npm ci
npm run db:generate
npm run dev
```
