# Qevli V37 fixed package

This build fixes the dashboard FeedItem narrowing errors (`originalPostId` / `targetId`) and the OFFICIAL/QVIEWS `sourceHandle` union error.

It also loads `.env` for tsx scripts through `dotenv/config`, adds the missing automatic Official Source Registry UI to `/admin`, and keeps local storage as the default. R2/S3 remains optional.

## Local commands
```powershell
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed:official-sources
npm run seed:official-feed
npm run dev
```
Do not run `prisma migrate reset`.
