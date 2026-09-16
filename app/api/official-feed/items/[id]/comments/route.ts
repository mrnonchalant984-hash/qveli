import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bad, created, notFound, ok, serverError, unauthorized } from '@/lib/http';
import { cleanText } from '@/lib/validation';
const author={select:{id:true,username:true,name:true,avatarUrl:true,verified:true}} as const;
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  try{const {id}=await params;const item=await prisma.officialFeedItem.findUnique({where:{id},select:{id:true}});if(!item)return notFound('Official update not found.');const comments=await prisma.officialFeedComment.findMany({where:{itemId:id},include:{user:author},orderBy:{createdAt:'asc'}});return ok({comments:comments.map(c=>({id:c.id,itemId:c.itemId,text:c.text,createdAt:c.createdAt,author:c.user}))});}catch{return serverError();}
}
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{const me=await getCurrentUser();if(!me)return unauthorized();const {id}=await params;const item=await prisma.officialFeedItem.findUnique({where:{id},select:{id:true}});if(!item)return notFound('Official update not found.');const b=await req.json().catch(()=>({}));const text=cleanText(b.text,2000);if(!text)return bad('Comment cannot be empty.');const comment=await prisma.officialFeedComment.create({data:{itemId:id,userId:me.id,text},include:{user:author}});return created({comment:{id:comment.id,itemId:comment.itemId,text:comment.text,createdAt:comment.createdAt,author:comment.user}});}catch(e){console.error(e);return serverError();}
}
