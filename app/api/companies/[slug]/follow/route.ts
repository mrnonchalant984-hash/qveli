import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bad, ok, unauthorized, notFound, serverError } from "@/lib/http";
export async function POST(_:Request,{params}:{params:Promise<{slug:string}>}){try{const me=await getCurrentUser();if(!me)return unauthorized();const {slug}=await params;const c=await prisma.company.findUnique({where:{slug:slug.toLowerCase()}});if(!c)return notFound("Company page not found.");const existing=await prisma.companyFollow.findUnique({where:{companyId_userId:{companyId:c.id,userId:me.id}}});if(existing){await prisma.companyFollow.delete({where:{id:existing.id}});return ok({following:false});}await prisma.companyFollow.create({data:{companyId:c.id,userId:me.id}});return ok({following:true});}catch{return serverError();}}
