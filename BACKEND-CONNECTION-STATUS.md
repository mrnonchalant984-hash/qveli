# QEVLI backend connection status

This build wires the existing UI to the existing PostgreSQL/Prisma backend without changing the visual design.

Connected UI flows:
- Signup -> POST /api/auth/signup -> session cookie -> dashboard
- Login -> POST /api/auth/login -> session cookie -> dashboard
- Current user -> /api/auth/me
- Dashboard -> /api/dashboard, /api/posts, /api/stories
- Create post -> POST /api/posts
- Create story -> POST /api/stories
- Reactions -> POST /api/posts/:id/reactions
- Notifications -> /api/notifications and mark-read endpoint
- Messages -> /api/messages/conversations and /api/messages/conversations/:id/messages
- Profile -> /api/users/me and own posts

The PostgreSQL connection itself is supplied through DATABASE_URL in .env. No private credentials are included.
