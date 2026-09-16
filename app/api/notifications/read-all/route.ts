import { getCurrentUser } from '@/lib/auth'; import { prisma } from '@/lib/prisma'; import { ok, unauthorized, serverError } from '@/lib/http';
export async function POST(){try{const me=await getCurrentUser();if(!me)return unauthorized();await prisma.notification.updateMany({where:{recipientId:me.id,readAt:null},data:{readAt:new Date()}});return ok({readAll:true});}catch{return serverError();}}
