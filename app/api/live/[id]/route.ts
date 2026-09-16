import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, ok, unauthorized, serverError } from "@/lib/http";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{const me=await getCurrentUser();if(!me)return unauthorized();const {id}=await params;const s=await prisma.liveStream.findUnique({where:{id}});if(!s||s.hostId!==me.id)return bad("Live stream not found.",404);const b=await req.json().catch(()=>({}));const status=String(b.status||"");if(!["LIVE","ENDED"].includes(status))return bad("Invalid live status.");const stream=await prisma.liveStream.update({where:{id},data:{status,endedAt:status==="ENDED"?new Date():null}});return ok({stream});}catch{return serverError();}}
