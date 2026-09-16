import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, ok, unauthorized, serverError } from '@/lib/http';

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return unauthorized();
    if (me.role !== 'ADMIN') return bad('Admin access required.', 403);

    const boosts = await prisma.profileBoost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        targetUser: { select: { id: true, name: true, username: true, email: true } },
        requester: { select: { id: true, name: true, username: true, email: true } },
      },
      take: 200,
    });

    return ok({ boosts });
  } catch {
    return serverError();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me) return unauthorized();
    if (me.role !== 'ADMIN') return bad('Admin access required.', 403);

    const body = await req.json();
    const boostId = String(body.boostId || '').trim();
    const decision = String(body.decision || '').trim().toUpperCase();
    if (!boostId) return bad('Boost id is required.', 400);
    if (!['APPROVE', 'REJECT'].includes(decision)) return bad('Decision must be APPROVE or REJECT.', 400);

    const boost = await prisma.profileBoost.findUnique({ where: { id: boostId } });
    if (!boost) return bad('Boost not found.', 404);

    const nextStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const durationDays = Number((boost.metadata as any)?.durationDays || 30);
    const expiresAt = decision === 'APPROVE' ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;

    const updated = await prisma.profileBoost.update({
      where: { id: boostId },
      data: {
        status: nextStatus,
        approvedByUserId: me.id,
        approvedAt: decision === 'APPROVE' ? new Date() : null,
        expiresAt,
      },
    });

    if (decision === 'APPROVE') {
      await prisma.user.update({
        where: { id: boost.targetUserId },
        data: { profileBoostedUntil: expiresAt },
      });
    }

    return ok({ boost: updated });
  } catch {
    return serverError();
  }
}
