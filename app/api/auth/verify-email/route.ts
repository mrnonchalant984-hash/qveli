import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bad, ok, serverError } from '@/lib/http';
import { hashSecret } from '@/lib/platform';
export async function POST(req: NextRequest) { try { const { token } = await req.json(); const hash=hashSecret(String(token||'')); const row=await prisma.emailVerificationToken.findUnique({where:{tokenHash:hash}}); if(!row||row.usedAt||row.expiresAt<new Date()) return bad('Verification link is invalid or expired.',400); await prisma.$transaction([prisma.emailVerificationToken.update({where:{id:row.id},data:{usedAt:new Date()}}),prisma.user.update({where:{id:row.userId},data:{emailVerifiedAt:new Date()}})]); return ok({verified:true}); } catch { return serverError(); } }
