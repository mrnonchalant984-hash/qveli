import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ok, unauthorized, bad, notFound, serverError } from '@/lib/http';

export async function POST(_req:Request,{params}:{params:Promise<{id:string}>}){
  try{
    const me=await getCurrentUser(); if(!me)return unauthorized();
    const {id}=await params;
    const post=await prisma.post.findUnique({where:{id},select:{id:true,authorId:true,visibility:true,text:true}});
    if(!post)return notFound('Post not found.');
    if(post.visibility!=='PUBLIC' && post.authorId!==me.id)return bad('This post is not shareable.',403);
    const share=await prisma.postShare.upsert({where:{postId_userId:{postId:id,userId:me.id}},create:{postId:id,userId:me.id},update:{} });
    if(post.authorId!==me.id){
      await prisma.notification.create({data:{recipientId:post.authorId,actorId:me.id,type:'SYSTEM',message:`${me.name} shared your post.`,link:`/posts/${id}`}}).catch(()=>null);
    }
    return ok({share,shared:true});
  }catch(e){console.error(e);return serverError();}
}
