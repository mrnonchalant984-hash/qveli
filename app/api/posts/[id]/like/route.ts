import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, unauthorized, notFound, serverError } from "@/lib/http";
import { notify } from "@/lib/notifications";
export async function POST(_:NextRequest,{params}:{params:Promise<{id:string}>}){try{const me=await getCurrentUser();if(!me)return unauthorized();const {id}=await params;const post=await prisma.post.findUnique({where:{id}});if(!post)return notFound("Post not found.");const existing=await prisma.postReaction.findUnique({where:{postId_userId:{postId:id,userId:me.id}}});if(existing)await prisma.postReaction.delete({where:{id:existing.id}});else{await prisma.postReaction.create({data:{postId:id,userId:me.id,type:"LIKE"}});if(post.authorId!==me.id)await notify(post.authorId,"LIKE",`${me.name} liked your post.`,me.id,`/posts/${id}`);}return ok({reacted:!existing});}catch{return serverError();}}
