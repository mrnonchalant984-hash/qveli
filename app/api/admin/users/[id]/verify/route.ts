import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, ok, unauthorized, notFound, serverError } from "@/lib/http";
export async function PATCH(req: NextRequest,{params}:{params:Promise<{id:string}>}) {
  try { const me=await getCurrentUser(); if(!me)return unauthorized(); if(me.role!=="ADMIN")return bad("Admin access required.",403); const {id}=await params; const target=await prisma.user.findUnique({where:{id}}); if(!target)return notFound("User not found."); const b=await req.json().catch(()=>({})); const verified=Boolean(b.verified); if(verified&&!target.professionalMode)return bad("Professional mode must be enabled before verification."); const user=await prisma.user.update({where:{id},data:{verified,verifiedAt:verified?new Date():null}}); return ok({user:{id:user.id,name:user.name,username:user.username,verified:user.verified,professionalMode:user.professionalMode}}); } catch{return serverError();}
}
