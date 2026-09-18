import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, created, ok, unauthorized, serverError } from '@/lib/http';
import { cleanText } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

const allowedTargets = new Set(['OFFICIAL','QVIEWS']);
const allowedActions = new Set(['REACTION','COMMENT','SHARE','REPOST']);
const allowedReactions = new Set(['LIKE','LOVE','HAHA','WOW','SAD','ANGRY']);
const author={select:{id:true,username:true,name:true,avatarUrl:true,verified:true}} as const;

export async function GET(req:NextRequest){
  try{
    const u=new URL(req.url);const targetType=String(u.searchParams.get('targetType')||'').toUpperCase();const targetId=String(u.searchParams.get('targetId')||'');
    if(!allowedTargets.has(targetType)||!targetId)return bad('A valid feed target is required.');
    const me=await getCurrentUser();
    const activities=await prisma.feedActivity.findMany({where:{targetType,targetId},include:{user:author,replies:{include:{user:author},orderBy:{createdAt:'asc'}}},orderBy:{createdAt:'asc'}});
    const reactions=activities.filter(a=>a.action==='REACTION');
    const comments=activities.filter(a=>a.action==='COMMENT').map((a:any)=>({...a,postId:a.targetId,author:a.user,replies:(a.replies||[]).map((r:any)=>({...r,postId:r.targetId,author:r.user}))}));
    return ok({
      counts:{reactions:reactions.length,comments:comments.length,shares:activities.filter(a=>a.action==='SHARE').length,reposts:activities.filter(a=>a.action==='REPOST').length},
      reacted:me?reactions.find(a=>a.userId===me.id)?.reactionType||null:null,
      comments
    });
  }catch(e){console.error(e);return serverError();}
}

export async function POST(req:NextRequest){
  try{
    const me=await getCurrentUser();if(!me)return unauthorized();
    const rl=await rateLimit(`feed-activity:${me.id}`,120,60);if(!rl.allowed)return bad('You are doing that too quickly. Please wait a moment.',429);const b=await req.json().catch(()=>({}));const targetType=String(b.targetType||'').toUpperCase();const targetId=String(b.targetId||'');const action=String(b.action||'').toUpperCase();
    if(!allowedTargets.has(targetType)||!targetId)return bad('A valid feed target is required.');
    if(!allowedActions.has(action))return bad('Invalid feed activity.');
    if(action==='REACTION'){
      const reactionType=String(b.reactionType||'LIKE').toUpperCase();if(!allowedReactions.has(reactionType))return bad('Invalid reaction.');
      const existing=await prisma.feedActivity.findFirst({where:{userId:me.id,targetType,targetId,action:'REACTION'}});
      if(existing?.reactionType===reactionType){await prisma.feedActivity.delete({where:{id:existing.id}});return ok({active:false,reactionType:null});}
      if(existing){await prisma.feedActivity.update({where:{id:existing.id},data:{reactionType}});return ok({active:true,reactionType});}
      await prisma.feedActivity.create({data:{userId:me.id,targetType,targetId,action,reactionType}});return created({active:true,reactionType});
    }
    if(action==='COMMENT'){
      const text=cleanText(b.text,2000);if(!text)return bad('Comment cannot be empty.');
      const parentId=typeof b.parentId==='string'&&b.parentId?b.parentId:null;
      if(parentId){const parent=await prisma.feedActivity.findFirst({where:{id:parentId,targetType,targetId,action:'COMMENT'}});if(!parent)return bad('Reply target not found.');}
      const comment=await prisma.feedActivity.create({data:{userId:me.id,targetType,targetId,action,text,parentId},include:{user:author}});
      return created({comment});
    }
    const existing=await prisma.feedActivity.findFirst({where:{userId:me.id,targetType,targetId,action}});
    if(existing)return ok({active:true,activity:existing});
    const activity=await prisma.feedActivity.create({data:{userId:me.id,targetType,targetId,action}});
    return created({active:true,activity});
  }catch(e){console.error(e);return serverError();}
}
