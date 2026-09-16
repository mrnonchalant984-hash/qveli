import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, notFound, ok, serverError, unauthorized } from '@/lib/http';

const allowed = new Set(['LIKE','LOVE','HAHA','WOW','SAD','ANGRY']);
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const me=await getCurrentUser(); if(!me)return unauthorized();
    const {id}=await params;
    const item=await prisma.officialFeedItem.findUnique({where:{id},select:{id:true}}); if(!item)return notFound('Official update not found.');
    const body=await req.json().catch(()=>({})); const type=String(body.type||'LIKE').toUpperCase(); if(!allowed.has(type))return bad('Invalid reaction.');
    const existing=await prisma.officialFeedReaction.findUnique({where:{itemId_userId:{itemId:id,userId:me.id}}});
    if(existing?.type===type){await prisma.officialFeedReaction.delete({where:{id:existing.id}});return ok({reacted:false,type:null});}
    if(existing)await prisma.officialFeedReaction.update({where:{id:existing.id},data:{type:type as any}});
    else await prisma.officialFeedReaction.create({data:{itemId:id,userId:me.id,type:type as any}});
    return ok({reacted:true,type});
  }catch(e){console.error(e);return serverError();}
}
