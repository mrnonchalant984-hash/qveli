import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, created, unauthorized, serverError } from '@/lib/http';
import { enqueueQevliJob } from '@/lib/queue';

export async function POST(req:NextRequest){
  try{
    const u=await getCurrentUser(); if(!u)return unauthorized();
    const b=await req.json(); const assetId=String(b.assetId||''); if(!assetId)return bad('assetId is required.');
    const asset=await prisma.mediaAsset.findFirst({where:{id:assetId,ownerId:u.id}}); if(!asset)return bad('Media asset not found.',404);
    await prisma.mediaAsset.update({where:{id:asset.id},data:{status:'PROCESSING'}});
    const job=await enqueueQevliJob('qevli-media','process-media',{assetId:asset.id,ownerId:u.id,url:asset.url,mimeType:asset.mimeType});
    return created({queued:Boolean(job),jobId:job?.id??null,assetId:asset.id,status:'PROCESSING'});
  }catch(e){console.error(e);return serverError();}
}
