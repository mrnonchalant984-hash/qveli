import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ok, unauthorized, serverError } from '@/lib/http';

export async function GET() {
  try {
    const u = await getCurrentUser();
    if (!u) return unauthorized();

    const [notifications, messages, latestNotification, latestMessage] = await Promise.all([
      prisma.notification.count({ where: { recipientId: u.id, readAt: null } }),
      prisma.message.count({
        where: {
          conversation: { members: { some: { userId: u.id } } },
          senderId: { not: u.id },
          readAt: null,
        },
      }),
      prisma.notification.findFirst({
        where: { recipientId: u.id },
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true },
      }),
      prisma.message.findFirst({
        where: { conversation: { members: { some: { userId: u.id } } } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, createdAt: true },
      }),
    ]);

    return ok({
      notifications,
      messages,
      latestNotification,
      latestMessage,
      serverTime: new Date().toISOString(),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return serverError();
  }
}
