import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, created, ok, unauthorized, serverError } from "@/lib/http";

export async function GET(){try{const me=await getCurrentUser();if(!me)return unauthorized();const calls=await prisma.callSession.findMany({where:{OR:[{callerId:me.id},{calleeId:me.id}]},orderBy:{createdAt:"desc"},take:50,include:{caller:{select:{id:true,name:true,username:true,avatarUrl:true,verified:true}},callee:{select:{id:true,name:true,username:true,avatarUrl:true,verified:true}}}});return ok({calls});}catch{return serverError();}}
export async function POST(req:NextRequest){try{const me=await getCurrentUser();if(!me)return unauthorized();const b=await req.json();const username=String(b.username||"").trim().toLowerCase();const kind=String(b.kind||"VIDEO").toUpperCase()==="VOICE"?"VOICE":"VIDEO";const callee=await prisma.user.findUnique({where:{username}});if(!callee||callee.id===me.id)return bad("Enter another Qevli username.");const call=await prisma.callSession.create({data:{callerId:me.id,calleeId:callee.id,kind,status:"RINGING"}});await prisma.notification.create({data:{recipientId:callee.id,actorId:me.id,type:"SYSTEM",message:`Incoming ${kind.toLowerCase()} call from @${me.username}`,link:`/calls`}});return created({call});}catch{return serverError();}}
