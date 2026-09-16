# Qevli V31.8 — Real Data Hardening

This build removes remaining demo-account behavior from the seed script and hardens core social flows.

- No demo user is created by Prisma seed.
- Signup now collects phone, date of birth and gender, then stores the signup session and routes to real email/phone OTP verification.
- Friend requests create real database records and notifications; accepts notify the requester.
- Login password recovery points to the real reset flow instead of a fake placeholder.
- Login no longer presents fake Google/Apple buttons as if OAuth were connected.
- Messaging renders real user avatars and message notifications point to the real messages page.
- Dashboard and message/profile avatars remain compact.
- Payments and monetization remain disabled.

No Prisma schema migration is required for these changes.
