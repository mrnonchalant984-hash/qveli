# Qevli

Qevli is a mobile-first social platform built with Next.js 15, TypeScript, Prisma 7 and PostgreSQL.

## Included in this build
- PostgreSQL + Prisma 7 driver adapter connection
- Signup/login/session authentication
- Real posts, comments, reactions, stories and notifications
- Photo/video uploads for posts, stories, messages, avatars and cover images (local development storage)
- Real one-to-one messaging with message notifications
- People search, follows and public profiles
- Explore search with Qevli people/posts/company pages plus public knowledge summaries for searches such as OpenAI, Meta and Elon Musk
- Official Qviews company page and follower count
- Professional mode with daily tasks and weekly goals (10 followers / 20 posts)
- Admin-only verification; professional mode is required before a badge can be granted
- Qevli admin setup is restricted by the admin script to the `leonard` username

## Local setup
1. Create `.env` from `.env.example` and set your real PostgreSQL `DATABASE_URL` and `AUTH_SECRET`.
2. Run `npm install`
3. Run `npx prisma generate`
4. Run `npx prisma migrate deploy`
5. Run `npm run dev`
6. Open http://localhost:3000

## Admin
Only an account with the `ADMIN` role can open `/admin` or grant verification. The supplied `create-admin.js` script only permits the `leonard` username.

## Media storage
For local development, uploads are stored under `public/uploads`. This is intentionally simple for local testing. Before a Vercel production deployment, replace this storage with a persistent object store such as Cloudinary or S3.


## Profile and web discovery update
- Profile now supports school/university, workplace/company, job title, current city, hometown, website, education/field, and interests.
- School/workplace fields provide web-backed suggestions.
- Explore now returns Qevli results plus public web results and a quick-knowledge card.
- For broad web search, add `GOOGLE_CSE_API_KEY` + `GOOGLE_CSE_ID` or `BRAVE_SEARCH_API_KEY` to `.env`; without a key, Wikipedia is used as a free fallback.
- Local uploads are available at `/api/uploads` for development.

## Qevli V9 feature layer

This build includes backend-connected V1/V2 social functionality plus:
- Accounts/profiles, feed, text/image/video posts, reactions, comments
- 1-to-1 messaging and notifications
- Groups and group chat with PostgreSQL persistence
- Stories with media and views
- Voice/video call UI with backend call-session state
- Live streaming UI with backend live-session state (media transport is a later infrastructure layer)
- Admin-controlled verification badges and moderation/reporting
- Creator Studio / Professional Mode with daily and weekly progress
- Search/discovery, official Qviews pages, block/report
- Dark/light mode and mobile-first responsive styling
- Uploads and lightweight polling designed for slower connections

Run after extracting:

```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Do not run `prisma migrate reset` on a database containing your existing account/data.


## V31.3 signup and verification
- Signup is now a multi-step flow: account details -> birthday/gender -> phone.
- New accounts require both email and phone verification before the first login.
- Email OTP uses Resend when `QEVLI_EMAIL_ENABLED=true` with `RESEND_API_KEY` and `EMAIL_FROM`.
- Phone OTP uses Twilio Messaging with `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
- Local development shows temporary OTP codes only when real providers are not configured; production never returns OTP codes.
- `LaunchSplash` shows the centered Qevli logo briefly before the app opens.
- Run `npm install`, `npx prisma generate`, `npx prisma migrate deploy`, then `npm run dev`.
