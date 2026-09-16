import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, ok, unauthorized, serverError } from "@/lib/http";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{const me=await getCurrentUser();if(!me)return unauthorized();const {id}=await params;const c=await prisma.callSession.findUnique({where:{id}});if(!c||![c.callerId,c.calleeId].includes(me.id))return bad("Call not found.",404);const b=await req.json().catch(()=>({}));const status=["RINGING","ACTIVE","DECLINED","ENDED"].includes(String(b.status))?String(b.status):null;if(!status)return bad("Invalid call status.");const data:any={status};if(status==="ACTIVE")data.startedAt=new Date();if(status==="ENDED"||status==="DECLINED")data.endedAt=new Date();const call=await prisma.callSession.update({where:{id},data});return ok({call});}catch{return serverError();}}
