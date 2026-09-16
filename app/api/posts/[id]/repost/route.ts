import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notify } from '@/lib/notifications';
import { bad, ok, unauthorized, notFound, serverError } from '@/lib/http';
import { cleanText } from '@/lib/validation';
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 try{const me=await getCurrentUser();if(!me)return unauthorized();const {id}=await params;const post=await prisma.post.findUnique({where:{id},select:{id:true,authorId:true,visibility:true}});if(!post)return notFound('Post not found.');if(post.visibility!=='PUBLIC'&&post.authorId!==me.id)return bad('This post cannot be reposted.',403);const b=await req.json().catch(()=>({}));const text=cleanText(b.text,1000);const repost=await prisma.repost.upsert({where:{postId_authorId:{postId:id,authorId:me.id}},create:{postId:id,authorId:me.id,text},update:{text}});if(post.authorId!==me.id)await notify(post.authorId,'SYSTEM',`${me.name} reposted your post.`,me.id,`/posts/${id}`);return ok({repost,reposted:true});}catch{return serverError();}
}
