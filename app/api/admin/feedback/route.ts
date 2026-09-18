import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, ok, unauthorized, serverError } from '@/lib/http';

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== 'ADMIN') return bad('Admin access required.', 403);
  try {
    const body = await req.json();
    const status = String(body.status || '').toUpperCase();
    if (!['REQUESTED', 'PLANNED', 'IN_PROGRESS', 'DONE'].includes(status)) return bad('Invalid status.');
    const request = await prisma.featureRequest.update({ where: { id: String(body.requestId || '') }, data: { status: status as any } });
    return ok({ request });
  } catch { return serverError(); }
}
