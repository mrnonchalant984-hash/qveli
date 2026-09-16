import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notifications';
import { bad, created, ok, unauthorized, notFound, serverError } from '@/lib/http';
import { cleanText } from '@/lib/validation';

const author={select:{id:true,username:true,name:true,avatarUrl:true,verified:true}} as const;
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
  try{const {id}=await params; const comments=await prisma.comment.findMany({where:{postId:id},include:{author,replies:{include:{author},orderBy:{createdAt:'asc'}}},orderBy:{createdAt:'asc'}}); return ok({comments});}
  catch{return serverError();}
}
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{const me=await getCurrentUser(); if(!me)return unauthorized(); const {id}=await params; const post=await prisma.post.findUnique({where:{id},select:{id:true,authorId:true}}); if(!post)return notFound('Post not found.');
    const b=await req.json().catch(()=>({})); const text=cleanText(b.text,2000); const parentId=typeof b.parentId==='string'&&b.parentId?b.parentId:null; if(!text)return bad('Comment cannot be empty.');
    if(parentId){const parent=await prisma.comment.findFirst({where:{id:parentId,postId:id}});if(!parent)return bad('Reply target not found.');}
    const comment=await prisma.comment.create({data:{postId:id,authorId:me.id,parentId,text},include:{author}});
    const recipient=parentId ? (await prisma.comment.findUnique({where:{id:parentId},select:{authorId:true}}))?.authorId : post.authorId;
    if(recipient)await notify(recipient,'COMMENT',parentId?`${me.name} replied to your comment.`:`${me.name} commented on your post.`,me.id,`/posts/${id}`);
    return created({comment});
  }catch{return serverError();}
}
