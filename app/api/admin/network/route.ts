import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ok, bad, unauthorized, serverError } from '@/lib/http';
import { flags } from '@/lib/platform';

export async function GET(){
  try{
    const u=await getCurrentUser(); if(!u)return unauthorized();
    if(u.role!=='ADMIN')return bad('Admin access required.',403);
    const now=Date.now();
    const activeCutoff=new Date(now-5*60*1000), windowStart=new Date(now-15*60*1000), dayStart=new Date(now-24*60*60*1000);
    const dbStart=Date.now(); await prisma.$queryRaw`SELECT 1`; const dbLatencyMs=Date.now()-dbStart;
    const [activeUsers,heartbeats15m,events15m,events24h,sessions,queuedJobs,openModeration,posts24h,messages24h]=await Promise.all([
      prisma.user.count({where:{lastSeenAt:{gte:activeCutoff}}}),
      prisma.analyticsEvent.count({where:{name:'presence_heartbeat',createdAt:{gte:windowStart}}}),
      prisma.analyticsEvent.count({where:{createdAt:{gte:windowStart}}}),
      prisma.analyticsEvent.count({where:{createdAt:{gte:dayStart}}}),
      prisma.userSession.count({where:{revokedAt:null,lastSeenAt:{gte:activeCutoff}}}),
      prisma.backgroundJob.count({where:{status:{in:['QUEUED','RUNNING']}}}),
      prisma.moderationCase.count({where:{status:{in:['OPEN','REVIEWING']}}}),
      prisma.post.count({where:{createdAt:{gte:dayStart}}}),
      prisma.message.count({where:{createdAt:{gte:dayStart}}}),
    ]);
    const heartbeatSeries=await prisma.analyticsEvent.groupBy({by:['name'],where:{createdAt:{gte:windowStart}},_count:{_all:true},orderBy:{_count:{name:'desc'}},take:12});
    return ok({timestamp:new Date().toISOString(),activeUsers,activeSessions:sessions,heartbeats15m,events15m,events24h,queuedJobs,openModeration,posts24h,messages24h,dbLatencyMs,features:flags,eventBreakdown:heartbeatSeries});
  }catch(e){console.error(e);return serverError();}
}
