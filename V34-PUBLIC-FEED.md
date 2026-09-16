# Qevli V34 — Public Feed + Official Updates

## What changed
- Public user posts are now visible in the main feed regardless of friendship/follow relationship, subject to post visibility and block rules.
- The feed can be requested without an authenticated session for public-feed consumers, while the dashboard still requires login.
- Qviews company updates are interleaved into the home feed.
- Official-source updates are stored separately from Qevli user/company posts and are clearly labeled with the source and source URL. Qevli does not impersonate external companies.
- Added current official-source feed cards for OpenAI/ChatGPT, GPT-6 Astra, Google Gemini, Claude, NBA, FIFA World Cup and Spain Football/RFEF.
- Added real post-share persistence and notifications.
- Added share counts to feed posts.

## Install
```powershell
cd C:\Users\MFONOBONG\Desktop\QEVLI
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed:official-feed
npm run dev
```

Do not run `prisma migrate reset`.

## Official feed seed
`npm run seed:official-feed` is idempotent. It upserts the curated official-source snapshots and the Qviews welcome update.

The external-source cards link to the source's official website. They are not presented as posts authored by those companies inside Qevli.
