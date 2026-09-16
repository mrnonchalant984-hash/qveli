import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ok, unauthorized, serverError } from '@/lib/http';
import { track } from '@/lib/platform';

const COOKIE = 'qevli_session';

export async function POST() {
  try {
    const u = await getCurrentUser();
    if (!u) return unauthorized();
    const now = new Date();
    await track(u.id, 'presence_heartbeat', '/api/realtime/presence');
    await prisma.user.update({ where: { id: u.id }, data: { lastSeenAt: now } });

    // Keep the active web session's heartbeat in sync too. This makes
    // Security > Sessions and social presence agree on the same activity.
    const token = (await cookies()).get(COOKIE)?.value;
    if (token) {
      const sessionHash = crypto.createHash('sha256').update(token).digest('hex');
      await prisma.userSession.updateMany({
        where: { userId: u.id, sessionHash, revokedAt: null },
        data: { lastSeenAt: now },
      });
    }
    return ok({ online: true, lastSeenAt: now.toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return serverError();
  }
}
