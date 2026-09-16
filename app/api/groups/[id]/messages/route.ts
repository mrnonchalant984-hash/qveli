import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, created, ok, unauthorized, serverError } from "@/lib/http";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const me=await getCurrentUser(); if(!me)return unauthorized(); const {id}=await params; const member=await prisma.groupMember.findUnique({where:{groupId_userId:{groupId:id,userId:me.id}}}); if(!member)return bad("You are not a member of this group.",403); const messages=await prisma.groupMessage.findMany({where:{groupId:id},orderBy:{createdAt:"asc"},take:200,include:{sender:{select:{id:true,name:true,username:true,avatarUrl:true,verified:true}}}}); return ok({messages}); } catch { return serverError(); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const me=await getCurrentUser(); if(!me)return unauthorized(); const {id}=await params; const member=await prisma.groupMember.findUnique({where:{groupId_userId:{groupId:id,userId:me.id}}}); if(!member)return bad("You are not a member of this group.",403); const b=await req.json(); const text=String(b.text||"").trim(); if(!text)return bad("Write a message first."); const message=await prisma.groupMessage.create({data:{groupId:id,senderId:me.id,text:text.slice(0,5000),mediaUrl:b.mediaUrl?String(b.mediaUrl).slice(0,2000):null,mediaType:b.mediaType?String(b.mediaType).slice(0,30):null},include:{sender:{select:{id:true,name:true,username:true,avatarUrl:true,verified:true}}}}); return created({message}); } catch { return serverError(); }
}
