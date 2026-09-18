import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, created, ok, unauthorized, serverError } from '@/lib/http';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try {
    const status = new URL(req.url).searchParams.get('status');
    const requests = await prisma.featureRequest.findMany({ where: status && status !== 'ALL' ? { status: status as any } : undefined, orderBy: [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }], include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } }, votes: { where: { userId: user.id }, select: { id: true } }, _count: { select: { votes: true } } } });
    return ok({ requests: requests.map(request => ({ ...request, voteCount: request._count.votes, voted: request.votes.length > 0, votes: undefined, _count: undefined })) });
  } catch { return serverError(); }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try {
    const body = await req.json();
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim() || null;
    const category = String(body.category || 'FEATURE').toUpperCase();
    if (title.length < 3 || title.length > 160) return bad('Title must be between 3 and 160 characters.');
    if (!['BUG', 'FEATURE', 'IMPROVEMENT'].includes(category)) return bad('Choose a valid category.');
    const request = await prisma.featureRequest.create({ data: { userId: user.id, title, description, category: category as any, votes: { create: { userId: user.id } } }, include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } }, _count: { select: { votes: true } } } });
    return created({ request: { ...request, voteCount: request._count.votes, _count: undefined } });
  } catch { return serverError(); }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try {
    const body = await req.json();
    const requestId = String(body.requestId || '');
    const request = await prisma.featureRequest.findUnique({ where: { id: requestId } });
    if (!request) return bad('Request not found.', 404);
    const existing = await prisma.featureRequestVote.findUnique({ where: { requestId_userId: { requestId, userId: user.id } } });
    if (existing) await prisma.featureRequestVote.delete({ where: { id: existing.id } });
    else await prisma.featureRequestVote.create({ data: { requestId, userId: user.id } });
    const voteCount = await prisma.featureRequestVote.count({ where: { requestId } });
    return ok({ requestId, voted: !existing, voteCount });
  } catch { return serverError(); }
}
