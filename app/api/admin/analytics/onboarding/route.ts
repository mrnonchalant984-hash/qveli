import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, ok, unauthorized, serverError } from '@/lib/http';
export async function GET(){
  const user=await getCurrentUser(); if(!user)return unauthorized(); if(user.role!=='ADMIN')return bad('Admin access required.',403);
  try{
    const [sources,users,posts,messages,comments,reactions,events,unverified,coins] = await Promise.all([
      prisma.onboardingSurvey.groupBy({by:['source'],_count:{_all:true},orderBy:{_count:{source:'desc'}}}),
      prisma.user.count(),prisma.post.count(),prisma.message.count(),prisma.comment.count(),prisma.postReaction.count(),
      prisma.analyticsEvent.count({where:{createdAt:{gte:new Date(Date.now()-24*60*60*1000)}}}),
      prisma.user.count({where:{emailVerifiedAt:null}}),prisma.user.aggregate({_sum:{coinBalance:true}})
    ]);
    return ok({sources:sources.map(r=>({source:r.source,count:r._count._all})),stats:{users,posts,messages,comments,reactions,events24h:events,unverifiedUsers:unverified,totalCoins:coins._sum.coinBalance||0},generatedAt:new Date().toISOString()});
  }catch{return serverError();}
}
