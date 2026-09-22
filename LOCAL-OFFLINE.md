# Qevli local/offline development

The browser can open the Next.js shell on localhost without external services, but a real Qevli account/feed/messages system cannot work with no database at all. The current project uses Prisma + PostgreSQL (Neon in production). If the laptop is completely offline, Neon/Supabase/Resend/Redis/LiveKit cannot be reached.

For a genuinely offline full-stack development mode, Qevli would need a separate local database adapter (for example a SQLite/embedded development profile) and local substitutes for storage/email/realtime. That is a larger architectural change and is intentionally not mixed into this update so the production PostgreSQL/Supabase path is not damaged.

Minimum local backend setup: local PostgreSQL or a reachable development PostgreSQL DATABASE_URL, AUTH_SECRET, and the storage/email variables for the features being tested.
