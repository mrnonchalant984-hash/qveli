import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ok, unauthorized, serverError } from '@/lib/http';
import { flags } from '@/lib/platform';
export async function GET(){
  try{
    const u=await getCurrentUser(); if(!u)return unauthorized();
    const activeCutoff=new Date(Date.now()-5*60*1000), windowStart=new Date(Date.now()-15*60*1000);
    const dbStart=Date.now(); await prisma.$queryRaw`SELECT 1`; const dbLatencyMs=Date.now()-dbStart;
    const [activeUsers,heartbeats15m,events15m,unreadMessages,unreadNotifications]=await Promise.all([
      prisma.user.count({where:{lastSeenAt:{gte:activeCutoff}}}),
      prisma.analyticsEvent.count({where:{name:'presence_heartbeat',createdAt:{gte:windowStart}}}),
      prisma.analyticsEvent.count({where:{createdAt:{gte:windowStart}}}),
      prisma.message.count({where:{conversation:{members:{some:{userId:u.id}}},senderId:{not:u.id},readAt:null}}),
      prisma.notification.count({where:{recipientId:u.id,readAt:null}}),
    ]);
    return ok({activeUsers,heartbeats15m,events15m,unreadMessages,unreadNotifications,dbLatencyMs,redis:flags.redis,timestamp:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
  }catch(e){console.error(e);return serverError();}
}
