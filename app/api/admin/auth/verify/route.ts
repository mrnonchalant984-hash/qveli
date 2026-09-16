import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashSecret } from '@/lib/platform';
import { createSession, publicUser } from '@/lib/auth';
import { bad, ok, serverError } from '@/lib/http';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body.challengeId || '');
    const code = String(body.code || '').trim();
    if (!userId || !/^\d{6}$/.test(code)) return bad('Enter the 6-digit admin verification code.');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') return bad('Admin access required.', 403);

    const row = await prisma.adminAuthCode.findFirst({ where: { userId, usedAt: null }, orderBy: { createdAt: 'desc' } });
    if (!row || row.expiresAt < new Date()) return bad('That admin verification code has expired. Sign in again to request a new one.', 401);
    if (row.attempts >= 5) return bad('Too many verification attempts. Sign in again to request a new code.', 429);
    if (hashSecret(code) !== row.codeHash) {
      await prisma.adminAuthCode.update({ where: { id: row.id }, data: { attempts: { increment: 1 } } });
      return bad('Incorrect admin verification code.', 401);
    }

    await prisma.adminAuthCode.update({ where: { id: row.id }, data: { usedAt: new Date() } });
    await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
    await createSession(user.id);
    return ok({ user: publicUser(user) });
  } catch {
    return serverError();
  }
}
