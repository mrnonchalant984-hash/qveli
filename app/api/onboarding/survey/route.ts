import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, ok, unauthorized, serverError } from '@/lib/http';

const sources = new Set(['SCHOOL', 'FRIEND', 'GOOGLE', 'TIKTOK', 'INSTAGRAM', 'TWITTER', 'AI', 'OTHER']);

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try {
    const survey = await prisma.onboardingSurvey.findUnique({ where: { userId: user.id } });
    return ok({ completed: Boolean(survey) });
  } catch { return serverError(); }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  try {
    const body = await req.json();
    const source = String(body.source || '').trim().toUpperCase();
    const otherText = String(body.otherText || '').trim() || null;
    if (!sources.has(source)) return bad('Choose how you heard about Qevli.');
    if (source === 'OTHER' && !otherText) return bad('Tell us a little more.');
    const survey = await prisma.onboardingSurvey.upsert({ where: { userId: user.id }, update: { source: source as any, otherText }, create: { userId: user.id, source: source as any, otherText } });
    return ok({ survey, completed: true });
  } catch { return serverError(); }
}
