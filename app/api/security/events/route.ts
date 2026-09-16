import { getCurrentUser } from '@/lib/auth'; import { prisma } from '@/lib/prisma'; import { ok, unauthorized, serverError } from '@/lib/http';
export async function GET(){try{const u=await getCurrentUser();if(!u)return unauthorized();return ok({events:await prisma.securityEvent.findMany({where:{userId:u.id},orderBy:{createdAt:'desc'},take:50})});}catch{return serverError();}}
