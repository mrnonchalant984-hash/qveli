import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, created, ok, unauthorized, serverError } from "@/lib/http";
export async function GET(){try{const streams=await prisma.liveStream.findMany({where:{status:{in:["LIVE","SCHEDULED"]}},orderBy:{createdAt:"desc"},take:50,include:{host:{select:{id:true,name:true,username:true,avatarUrl:true,verified:true}}}});return ok({streams});}catch{return serverError();}}
export async function POST(req:NextRequest){try{const me=await getCurrentUser();if(!me)return unauthorized();const b=await req.json();const title=String(b.title||"").trim();if(title.length<2)return bad("Add a live title.");const stream=await prisma.liveStream.create({data:{hostId:me.id,title:title.slice(0,120),description:String(b.description||"").slice(0,2000),status:"LIVE",startedAt:new Date()},include:{host:{select:{id:true,name:true,username:true,avatarUrl:true,verified:true}}}});return created({stream});}catch{return serverError();}}
