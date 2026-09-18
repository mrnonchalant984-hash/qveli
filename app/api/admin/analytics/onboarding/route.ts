import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, ok, unauthorized, serverError } from '@/lib/http';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== 'ADMIN') return bad('Admin access required.', 403);
  try {
    const rows = await prisma.onboardingSurvey.groupBy({ by: ['source'], _count: { _all: true }, orderBy: { _count: { source: 'desc' } } });
    return ok({ sources: rows.map(row => ({ source: row.source, count: row._count._all })) });
  } catch { return serverError(); }
}
